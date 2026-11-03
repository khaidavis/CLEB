package com.platform.backend.reservation;

// The reservation lifecycle, straight from the CLEB manual's two-level approval.
// A booking moves THROUGH these states — it's a state machine:
//
//   PENDING_TECH  --(technician approves)-->  PENDING_ADMIN
//   PENDING_ADMIN --(admin approves)------->  APPROVED
//   either stage  --(reject)--------------->  REJECTED
//   the booker    --(cancel)--------------->  CANCELLED
//
// Right now these are just the allowed VALUES. The RULES for moving between
// them (who may do what, in what order) are business logic we build later —
// this enum is the vocabulary that logic will speak.
public enum ReservationStatus {
    PENDING_TECH,
    PENDING_ADMIN,
    APPROVED,
    REJECTED,
    CANCELLED
}
