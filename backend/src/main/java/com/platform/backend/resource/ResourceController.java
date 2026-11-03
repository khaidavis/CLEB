package com.platform.backend.resource;

import com.platform.backend.lab.Lab;
import com.platform.backend.lab.LabRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    // TWO repositories injected now: one for resources, one to look up the lab
    // a resource must belong to. Spring hands us both.
    private final ResourceRepository resourceRepository;
    private final LabRepository labRepository;

    public ResourceController(ResourceRepository resourceRepository,
                              LabRepository labRepository) {
        this.resourceRepository = resourceRepository;
        this.labRepository = labRepository;
    }

    @GetMapping
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // A resource can't exist without a lab, so the caller must say WHICH lab.
    // We take labId from the URL (?labId=1) and the rest from the JSON body.
    @PostMapping
    public Resource createResource(@RequestParam Long labId,
                                   @RequestBody Resource resource) {
        // findById returns an Optional — "maybe a lab, maybe nothing".
        // orElseThrow says: if that lab id doesn't exist, fail loudly instead
        // of silently saving a broken resource.
        Lab lab = labRepository.findById(labId)
                .orElseThrow(() -> new RuntimeException("No lab with id " + labId));

        resource.setLab(lab);              // attach the real, managed lab
        return resourceRepository.save(resource);
    }
}
