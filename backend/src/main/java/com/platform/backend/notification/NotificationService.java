package com.platform.backend.notification;

import com.platform.backend.reservation.Reservation;
import com.platform.backend.reservation.ReservationStatus;
import com.platform.backend.user.Role;
import com.platform.backend.user.User;
import com.platform.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    private void create(String recipientEmail, String message, String link) {
        Notification n = new Notification();
        n.setRecipientEmail(recipientEmail);
        n.setMessage(message);
        n.setLink(link);
        notificationRepository.save(n);
    }

    // Student booked -> tell every technician and admin.
    public void notifyStaffOfBooking(Reservation r) {
        String msg = "New booking request: " + r.getResource().getName()
                   + " by " + r.getUser().getFullName();
        List<User> staff = userRepository.findByRoleIn(List.of(Role.TECHNICIAN, Role.ADMIN));
        for (User u : staff) {
            create(u.getEmail(), msg, "/approvals");
        }
    }

    // A decision was made -> tell the student who booked it.
    public void notifyStudentOfDecision(Reservation r) {
        String resource = r.getResource().getName();
        String msg;
        if (r.getStatus() == ReservationStatus.APPROVED) {
            msg = "Your booking for " + resource + " was approved.";
        } else if (r.getStatus() == ReservationStatus.REJECTED) {
            msg = "Your booking for " + resource + " was rejected.";
        } else if (r.getStatus() == ReservationStatus.PENDING_ADMIN) {
            msg = "Your booking for " + resource + " cleared technician review and is awaiting admin approval.";
        } else {
            return; // no notable change
        }
        create(r.getUser().getEmail(), msg, "/reservations");
    }
}
