package com.platform.backend.reservation;

import com.platform.backend.notification.NotificationService;
import com.platform.backend.resource.Resource;
import com.platform.backend.resource.ResourceRepository;
import com.platform.backend.user.Role;
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
    private final NotificationService notificationService;

    public ReservationService(ReservationRepository reservationRepository,
                              ResourceRepository resourceRepository,
                              UserRepository userRepository,
                              NotificationService notificationService) {
        this.reservationRepository = reservationRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public Reservation book(String userEmail, Long resourceId, Instant start, Instant end) {
        log.info("Booking resource {} for {} on thread [{}]", resourceId, userEmail, Thread.currentThread().getName());
        if (start == null || end == null || !end.isAfter(start)) {
            throw new IllegalArgumentException("End time must be after start time.");
        }
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
        Reservation saved = reservationRepository.save(reservation);

        notificationService.notifyStaffOfBooking(saved);   // <-- emit event
        return saved;
    }

    @Transactional
    public Reservation decide(Long reservationId, String actorEmail, boolean approve) {
        User actor = userRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new IllegalArgumentException("Unknown user."));
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("No reservation with id " + reservationId));

        Role role = actor.getRole();
        ReservationStatus status = r.getStatus();

        if (approve) {
            if (status == ReservationStatus.PENDING_TECH && (role == Role.TECHNICIAN || role == Role.ADMIN)) {
                r.setStatus(ReservationStatus.PENDING_ADMIN);
            } else if (status == ReservationStatus.PENDING_ADMIN && role == Role.ADMIN) {
                r.setStatus(ReservationStatus.APPROVED);
            } else {
                throw new IllegalStateException("You can't approve this reservation at its current stage.");
            }
        } else {
            boolean canReject =
                    (status == ReservationStatus.PENDING_TECH && (role == Role.TECHNICIAN || role == Role.ADMIN)) ||
                    (status == ReservationStatus.PENDING_ADMIN && role == Role.ADMIN);
            if (!canReject) {
                throw new IllegalStateException("You can't reject this reservation at its current stage.");
            }
            r.setStatus(ReservationStatus.REJECTED);
        }
        Reservation saved = reservationRepository.save(r);

        notificationService.notifyStudentOfDecision(saved);   // <-- emit event
        return saved;
    }
}
