package com.platform.backend.lab;

import jakarta.persistence.*;

@Entity
@Table(name = "labs")
public class Lab {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;         // e.g. "SCIT Networking Lab"

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private int capacity;         // seats — from the CLEB manual

    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
}
