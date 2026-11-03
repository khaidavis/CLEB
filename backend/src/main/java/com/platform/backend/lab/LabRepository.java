package com.platform.backend.lab;

import org.springframework.data.jpa.repository.JpaRepository;

// That's it. An empty interface. You write NO implementation.
//
// By extending JpaRepository<Lab, Long> ("I manage Lab entities whose id is a Long"),
// Spring Data generates a full working implementation at runtime and hands you,
// for free:
//     findAll()      -> every lab
//     findById(id)   -> one lab
//     save(lab)      -> insert or update
//     deleteById(id) -> remove
//     count(), existsById(), and more
//
// You declared WHAT you manage; Spring wrote HOW. This is the payoff of data-jpa.
public interface LabRepository extends JpaRepository<Lab, Long> {
}
