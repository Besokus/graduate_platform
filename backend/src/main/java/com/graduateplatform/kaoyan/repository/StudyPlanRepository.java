package com.graduateplatform.kaoyan.repository;

import com.graduateplatform.kaoyan.entity.StudyPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface StudyPlanRepository extends JpaRepository<StudyPlan, Long> {

    List<StudyPlan> findByUserIdOrderByStartDateDesc(Long userId);

    Optional<StudyPlan> findByIdAndUserId(Long id, Long userId);
}