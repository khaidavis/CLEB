package com.platform.backend.auth;

import com.platform.backend.security.JwtService;
import com.platform.backend.user.User;
import com.platform.backend.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        User user = new User();
        user.setEmail(request.email());
        user.setFullName(request.fullName());
        user.setRole(request.role());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);
        return new UserResponse(saved.getId(), saved.getEmail(),
                                saved.getFullName(), saved.getRole());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        // 1. Find the user by email (or fail).
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // 2. Verify the password. matches() re-hashes the attempt and compares
        //    it to the stored hash — we NEVER decrypt the stored password
        //    (BCrypt is one-way; there's nothing to decrypt).
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // 3. Credentials good -> mint a signed token carrying email + role.
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token);
    }
}
