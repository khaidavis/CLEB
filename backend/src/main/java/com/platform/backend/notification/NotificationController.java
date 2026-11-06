package com.platform.backend.notification;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository repo;

    public NotificationController(NotificationRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Notification> mine(Authentication auth) {
        return repo.findByRecipientEmailOrderByCreatedAtDesc(auth.getName());
    }

    @GetMapping("/unread-count")
    public long unreadCount(Authentication auth) {
        return repo.countByRecipientEmailAndReadFlagFalse(auth.getName());
    }

    @PostMapping("/read-all")
    public void markAllRead(Authentication auth) {
        var items = repo.findByRecipientEmailOrderByCreatedAtDesc(auth.getName());
        items.forEach(n -> n.setReadFlag(true));
        repo.saveAll(items);
    }
}
