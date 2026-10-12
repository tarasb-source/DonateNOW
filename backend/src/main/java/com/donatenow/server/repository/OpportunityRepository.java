package com.donatenow.server.repository;

import com.donatenow.server.model.Opportunity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OpportunityRepository extends JpaRepository<Opportunity, Integer> {

    @Query("""
            SELECT o FROM Opportunity o
            WHERE (:category IS NULL
                OR LOWER(o.category) LIKE :category
                OR LOWER(o.location) LIKE :category
                OR LOWER(o.tags) LIKE :category)
            AND (:query IS NULL
                OR LOWER(o.title) LIKE :query
                OR LOWER(o.organization) LIKE :query
                OR LOWER(o.category) LIKE :query
                OR LOWER(o.tags) LIKE :query
                OR LOWER(o.location) LIKE :query)
            ORDER BY o.id ASC
            """)
    List<Opportunity> search(@Param("category") String category, @Param("query") String query);
}
