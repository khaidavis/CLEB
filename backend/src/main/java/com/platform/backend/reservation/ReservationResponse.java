package com.platform.backend.reservation;

import java.time.Instant;

public record ReservationResponse(
        Long id, Long resourceId, String resourceName, String labName,
        String bookedBy, Instant startTime, Instant endTime,
        ReservationStatus status, Instant createdAt) {

    public static ReservationResponse from(Reservation r) {
        return new ReservationResponse(
                r.getId(), r.getResource().getId(), r.getResource().getName(),
                r.getResource().getLab().getName(), r.getUser().getFullName(),
                r.getStartTime(), r.getEndTime(), r.getStatus(), r.getCreatedAt());
    }
}
