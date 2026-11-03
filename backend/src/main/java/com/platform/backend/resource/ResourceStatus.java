package com.platform.backend.resource;

// A resource is either bookable or pulled for maintenance.
// The CLEB manual's "Maintenance" state lives here.
public enum ResourceStatus {
    AVAILABLE,
    MAINTENANCE
}
