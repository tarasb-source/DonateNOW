package com.donatenow.server.controller;

import com.donatenow.server.model.Opportunity;
import com.donatenow.server.repository.OpportunityRepository;

import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/opportunities")
@Validated
public class OpportunityController {

    private final OpportunityRepository repository;

    public OpportunityController(OpportunityRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Opportunity> search(
            @RequestParam(required = false) @Size(max = 100) String q,
            @RequestParam(required = false) @Size(max = 50) String category
    ) {
        String trimmedCategory = category == null ? null : category.trim();
        boolean categoryIsAllOrEmpty = trimmedCategory == null || trimmedCategory.isEmpty() || trimmedCategory.equals("All");

        String categoryPattern = categoryIsAllOrEmpty ? null : likePattern(trimmedCategory);
        String queryPattern = likePattern(q);

        return repository.search(categoryPattern, queryPattern);
    }

    private String likePattern(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : "%" + trimmed.toLowerCase() + "%";
    }
}
