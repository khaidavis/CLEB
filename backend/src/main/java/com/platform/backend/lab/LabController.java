package com.platform.backend.lab;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/labs")
public class LabController {

    private final LabRepository labRepository;

    public LabController(LabRepository labRepository) {
        this.labRepository = labRepository;
    }

    @GetMapping
    public List<Lab> getAllLabs() {
        return labRepository.findAll();
    }

    @PostMapping
    public Lab createLab(@RequestBody Lab lab) {
        return labRepository.save(lab);
    }

    @DeleteMapping("/{id}")            // DELETE /api/labs/3
    public void deleteLab(@PathVariable Long id) {
        labRepository.deleteById(id);
    }
}
