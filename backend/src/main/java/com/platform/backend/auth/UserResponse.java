package com.platform.backend.auth;

import com.platform.backend.user.Role;

// What goes OUT. Notice what's MISSING: no password, no hash. Ever.
public record UserResponse(Long id, String email, String fullName, Role role) {
}
