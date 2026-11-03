package com.platform.backend.auth;

// What login returns: the token the client will send on future requests.
public record AuthResponse(String token) {
}
