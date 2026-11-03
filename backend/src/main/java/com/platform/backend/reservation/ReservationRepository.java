package com.platform.backend.reservation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Two time ranges overlap when: existing.start < new.end AND existing.end > new.start.
    // We ignore cancelled/rejected bookings — they don't hold the slot.
    @Query("""
        select count(r) from Reservation r
        where r.resource.id = :resourceId
          and r.status <> com.platform.backend.reservation.ReservationStatus.CANCELLED
          and r.status <> com.platform.backend.reservation.ReservationStatus.REJECTED
          and r.startTime < :endTime
          and r.endTime > :startTime
        """)
    long countOverlapping(@Param("resourceId") Long resourceId,
                          @Param("startTime") Instant startTime,
                          @Param("endTime") Instant endTime);

    List<Reservation> findByUserEmailOrderByStartTimeDesc(String email);
}
