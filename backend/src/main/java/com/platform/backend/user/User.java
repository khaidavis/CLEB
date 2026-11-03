package com.platform.backend.user;

import jakarta.persistence.*;
import java.time.Instant;

@Entity                       // "Hibernate: this class maps to a database table."
@Table(name = "users")        // Table name. NOT "user" — that's a reserved word in
                              // PostgreSQL and would cause errors. Small trap, real bug.
public class User {

    @Id                                                 // primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // DB auto-generates the id (1,2,3...)
    private Long id;

    @Column(nullable = false, unique = true)  // required, and no two users share an email
    private String email;

    @Column(nullable = false)
    private String passwordHash;   // we store a HASH, never the real password (Layer 4)

    @Column(nullable = false)
    private String fullName;

    @Enumerated(EnumType.STRING)   // store the role as text ("ADMIN"), not a number.
    @Column(nullable = false)      // STRING is readable in the DB and safe to reorder.
    private Role role;

    @Column(nullable = false)
    private boolean enabled = true;   // lets an admin disable an account without deleting it

    @Column(nullable = false, updatable = false)  // set once, never changed
    private Instant createdAt;

    @PrePersist                       // Hibernate runs this automatically before first save
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // --- Getters and setters: how other code reads/writes these private fields ---
    public Long getId() { return id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public Instant getCreatedAt() { return createdAt; }
}
