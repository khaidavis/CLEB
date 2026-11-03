package com.platform.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // You write the METHOD NAME; Spring Data writes the query.
    // "findByEmail" is parsed into "SELECT * FROM users WHERE email = ?".
    // Returns Optional because the email might not exist.
    Optional<User> findByEmail(String email);
}
