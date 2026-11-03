package com.platform.backend.resource;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    // PESSIMISTIC_WRITE = "SELECT ... FOR UPDATE": locks this resource's row until
    // the surrounding transaction commits. Other bookings for the same resource
    // BLOCK here and wait their turn. This is the heart of the concurrency fix.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Resource r where r.id = :id")
    Optional<Resource> findByIdForUpdate(@Param("id") Long id);
}
