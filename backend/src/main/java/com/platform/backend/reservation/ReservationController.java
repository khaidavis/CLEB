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

    public ReservationController(ReservationRepository reservationRepository,
                                 ReservationService reservationService) {
        this.reservationRepository = reservationRepository;
        this.reservationService = reservationService;
    }

    // ADMIN only (enforced in SecurityConfig)
    @GetMapping
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll().stream().map(ReservationResponse::from).toList();
    }

    // Any logged-in user: only their own bookings
    @GetMapping("/mine")
    public List<ReservationResponse> mine(Authentication auth) {
        return reservationRepository.findByUserEmailOrderByStartTimeDesc(auth.getName())
                .stream().map(ReservationResponse::from).toList();
    }

    @PostMapping
    public ReservationResponse create(@RequestBody BookingRequest body, Authentication auth) {
        return ReservationResponse.from(
                reservationService.book(auth.getName(), body.resourceId(), body.startTime(), body.endTime()));
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
