package com.platform.backend.reservation;

import com.platform.backend.resource.Resource;
import com.platform.backend.resource.ResourceRepository;
import com.platform.backend.user.User;
import com.platform.backend.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    private final ReservationRepository reservationRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              ResourceRepository resourceRepository,
                              UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Reservation book(String userEmail, Long resourceId, Instant start, Instant end) {
        log.info("Booking resource {} for {} on thread [{}]", resourceId, userEmail, Thread.currentThread().getName());

        if (start == null || end == null || !end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time.");
        }

        // The user is resolved from the token, not trusted from the request.
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Unknown user."));

        Resource resource = resourceRepository.findByIdForUpdate(resourceId)
                .orElseThrow(() -> new IllegalArgumentException("No resource with id " + resourceId));

        long overlaps = reservationRepository.countOverlapping(resourceId, start, end);
        if (overlaps > 0) {
            throw new IllegalStateException("That resource is already booked for the selected time.");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setResource(resource);
        reservation.setStartTime(start);
        reservation.setEndTime(end);
        return reservationRepository.save(reservation);
    }
}
