package com.platform.backend.user;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // TEMPORARY endpoint — just enough to create a user so reservations have an owner.
    // This is NOT real registration: it stores whatever password value is sent as-is
    // and even returns it. Layer 5 (Security) replaces this with proper password
    // hashing and stops exposing the hash. We're knowingly carrying that debt for now.
    @PostMapping
    public User createUser(@RequestBody User user) {
        return userRepository.save(user);
    }
}
