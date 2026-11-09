package com.platform.backend.reservation;

import com.platform.backend.notification.NotificationService;
import com.platform.backend.resource.Resource;
import com.platform.backend.resource.ResourceRepository;
import com.platform.backend.user.Role;
import com.platform.backend.user.User;
import com.platform.backend.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

// Unit test: the approval state machine in isolation. Repositories are MOCKED
// (fake stand-ins) so we test pure logic — no database, runs in milliseconds.
@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock ReservationRepository reservationRepository;
    @Mock ResourceRepository resourceRepository;
    @Mock UserRepository userRepository;
    @Mock NotificationService notificationService;

    @InjectMocks ReservationService service;   // the real service, with mocks injected

    private User userWithRole(Role role, String email) {
        User u = new User();
        u.setEmail(email);
        u.setFullName("Test");
        u.setRole(role);
        return u;
    }

    private Reservation reservationWithStatus(ReservationStatus status) {
        Reservation r = new Reservation();
        r.setStatus(status);
        r.setUser(userWithRole(Role.STUDENT, "student@x.com"));
        Resource res = new Resource();
        res.setName("Oscilloscope");
        r.setResource(res);
        return r;
    }

    @Test
    void technicianApproves_pendingTech_movesToPendingAdmin() {
        when(userRepository.findByEmail("tech@x.com"))
                .thenReturn(Optional.of(userWithRole(Role.TECHNICIAN, "tech@x.com")));
        when(reservationRepository.findById(1L))
                .thenReturn(Optional.of(reservationWithStatus(ReservationStatus.PENDING_TECH)));
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Reservation result = service.decide(1L, "tech@x.com", true);

        assertThat(result.getStatus()).isEqualTo(ReservationStatus.PENDING_ADMIN);
    }

    @Test
    void adminApproves_pendingAdmin_movesToApproved() {
        when(userRepository.findByEmail("admin@x.com"))
                .thenReturn(Optional.of(userWithRole(Role.ADMIN, "admin@x.com")));
        when(reservationRepository.findById(1L))
                .thenReturn(Optional.of(reservationWithStatus(ReservationStatus.PENDING_ADMIN)));
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Reservation result = service.decide(1L, "admin@x.com", true);

        assertThat(result.getStatus()).isEqualTo(ReservationStatus.APPROVED);
    }

    @Test
    void studentCannotApprove() {
        when(userRepository.findByEmail("student@x.com"))
                .thenReturn(Optional.of(userWithRole(Role.STUDENT, "student@x.com")));
        when(reservationRepository.findById(1L))
                .thenReturn(Optional.of(reservationWithStatus(ReservationStatus.PENDING_TECH)));

        assertThatThrownBy(() -> service.decide(1L, "student@x.com", true))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void reject_movesToRejected() {
        when(userRepository.findByEmail("tech@x.com"))
                .thenReturn(Optional.of(userWithRole(Role.TECHNICIAN, "tech@x.com")));
        when(reservationRepository.findById(1L))
                .thenReturn(Optional.of(reservationWithStatus(ReservationStatus.PENDING_TECH)));
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Reservation result = service.decide(1L, "tech@x.com", false);

        assertThat(result.getStatus()).isEqualTo(ReservationStatus.REJECTED);
    }
}
