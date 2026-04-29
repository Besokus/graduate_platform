package com.graduateplatform.repository;

import com.graduateplatform.entity.Attempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttemptRepository extends JpaRepository<Attempt, Long> {
    List<Attempt> findByUserId(Long userId);
    long countByUserId(Long userId);
}
