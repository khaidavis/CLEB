package com.platform.backend.reservation;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;

    public ReservationController(ReservationRepository reservationRepository, ReservationService reservationService) {
        this.reservationRepository = reservationRepository;
        this.reservationService = reservationService;
    }

    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @PostMapping
    public Reservation create(@RequestBody BookingRequest body, Authentication auth) {
        return reservationService.book(auth.getName(), body.resourceId(), body.startTime(), body.endTime());
    }

    @PostMapping("/{id}/approve")
    public Reservation approve(@PathVariable Long id, Authentication auth) {
        return reservationService.decide(id, auth.getName(), true);
    }

    @PostMapping("/{id}/reject")
    public Reservation reject(@PathVariable Long id, Authentication auth) {
        return reservationService.decide(id, auth.getName(), false);
    }

    public record BookingRequest(Long resourceId, Instant startTime, Instant endTime) {}

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> conflict(IllegalStateException e) {
        return Map.of("error", e.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> badRequest(IllegalArgumentException e) {
        return Map.of("error", e.getMessage());
    }
}
