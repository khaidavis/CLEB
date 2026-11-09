package com.platform.backend.reservation;

import com.platform.backend.lab.Lab;
import com.platform.backend.lab.LabRepository;
import com.platform.backend.resource.Resource;
import com.platform.backend.resource.ResourceRepository;
import com.platform.backend.user.Role;
import com.platform.backend.user.User;
import com.platform.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;

// Integration test: boots the real app against a REAL PostgreSQL in a throwaway
// Docker container (Testcontainers), then fires two bookings for the same slot
// at the same instant and proves the pessimistic lock prevents a double-booking.
@SpringBootTest
@Testcontainers
class ReservationConcurrencyTest {

    @Container
    @ServiceConnection   // auto-wires Spring's datasource to this container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired ReservationService reservationService;
    @Autowired UserRepository userRepository;
    @Autowired ResourceRepository resourceRepository;
    @Autowired LabRepository labRepository;
    @Autowired ReservationRepository reservationRepository;

    @Test
    void twoConcurrentBookingsForSameSlot_onlyOneSucceeds() throws Exception {
        // --- seed one user, one lab, one resource ---
        User user = new User();
        user.setEmail("racer@x.com");
        user.setFullName("Racer");
        user.setPasswordHash("x");
        user.setRole(Role.STUDENT);
        userRepository.save(user);

        Lab lab = new Lab();
        lab.setName("Race Lab");
        lab.setLocation("X");
        lab.setCapacity(10);
        labRepository.save(lab);

        Resource resource = new Resource();
        resource.setName("Contended Scope");
        resource.setType("oscilloscope");
        resource.setLab(lab);
        resourceRepository.save(resource);
        Long resourceId = resource.getId();

        Instant start = Instant.parse("2027-01-01T10:00:00Z");
        Instant end   = Instant.parse("2027-01-01T11:00:00Z");

        // --- fire two identical bookings at the exact same moment ---
        ExecutorService pool = Executors.newFixedThreadPool(2);
        CountDownLatch go = new CountDownLatch(1);
        Callable<Boolean> booking = () -> {
            go.await();                          // all threads wait here...
            try {
                reservationService.book("racer@x.com", resourceId, start, end);
                return true;                     // booked
            } catch (Exception e) {
                return false;                    // rejected (conflict)
            }
        };
        Future<Boolean> f1 = pool.submit(booking);
        Future<Boolean> f2 = pool.submit(booking);
        go.countDown();                          // ...released together

        boolean first = f1.get();
        boolean second = f2.get();
        pool.shutdown();

        // exactly one booking succeeded (XOR)
        assertThat(first ^ second).isTrue();
        // and the database holds exactly ONE reservation for that slot — no double-booking
        assertThat(reservationRepository.countOverlapping(resourceId, start, end)).isEqualTo(1L);
    }
}
