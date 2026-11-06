package com.platform.backend.notification;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String recipientEmail;   // who should see it

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private String link;             // where clicking it should take them

    @Column(nullable = false)
    private boolean readFlag = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = Instant.now(); }

    public Long getId() { return id; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String v) { this.recipientEmail = v; }
    public String getMessage() { return message; }
    public void setMessage(String v) { this.message = v; }
    public String getLink() { return link; }
    public void setLink(String v) { this.link = v; }
    public boolean isReadFlag() { return readFlag; }
    public void setReadFlag(boolean v) { this.readFlag = v; }
    public Instant getCreatedAt() { return createdAt; }
}
