package com.platform.backend.user;

import com.platform.backend.auth.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Safe list — returns UserResponse (no password hash), never the entity.
    @GetMapping
    public List<UserResponse> list() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole()))
                .toList();
    }

    // Admin promotes/demotes a user. Only admins can reach this (see SecurityConfig).
    @PatchMapping("/{id}/role")
    public UserResponse setRole(@PathVariable Long id, @RequestBody RoleRequest body) {
        if (body.role() == null) throw new IllegalArgumentException("Role is required.");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No user with id " + id));
        user.setRole(body.role());
        userRepository.save(user);
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }

    public record RoleRequest(Role role) {}

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> badRequest(IllegalArgumentException e) {
        return Map.of("error", e.getMessage());
    }
}
