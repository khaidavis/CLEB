package com.platform.backend.user;

// The three fixed roles from the CLEB manual.
// An enum is the right tool when the set of values is small and won't change
// at runtime — the compiler guarantees a user can ONLY be one of these three.
public enum Role {
    STUDENT,
    TECHNICIAN,
    ADMIN
}
