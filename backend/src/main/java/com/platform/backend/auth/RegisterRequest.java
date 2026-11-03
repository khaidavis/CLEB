package com.platform.backend.auth;

import com.platform.backend.user.Role;

// What comes IN when registering. Note: a raw "password", never a hash.
// A 'record' is a compact, immutable data holder — perfect for DTOs.
public record RegisterRequest(String email, String password, String fullName, Role role) {
}
