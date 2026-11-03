package com.platform.backend.resource;

import com.platform.backend.lab.Lab;
import jakarta.persistence.*;

@Entity
@Table(name = "resources")
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;          // e.g. "Oscilloscope #3"

    @Column(nullable = false)
    private String type;          // e.g. "oscilloscope", "workstation", "switch"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    // --- THE NEW CONCEPT: a relationship ---
    // "Many resources belong to one lab." This is the line in the ERD.
    @ManyToOne(optional = false)                       // every resource MUST have a lab
    @JoinColumn(name = "lab_id", nullable = false)     // creates the lab_id foreign-key column
    private Lab lab;

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public ResourceStatus getStatus() { return status; }
    public void setStatus(ResourceStatus status) { this.status = status; }
    public Lab getLab() { return lab; }
    public void setLab(Lab lab) { this.lab = lab; }
}
