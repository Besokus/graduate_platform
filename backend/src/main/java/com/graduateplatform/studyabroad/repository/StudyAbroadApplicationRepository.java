package com.graduateplatform.studyabroad.repository;

import com.graduateplatform.studyabroad.entity.StudyAbroadApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudyAbroadApplicationRepository extends JpaRepository<StudyAbroadApplication, Long> {
    List<StudyAbroadApplication> findByUserIdOrderByDeadlineAsc(Long userId);

    Optional<StudyAbroadApplication> findByIdAndUserId(Long id, Long userId);
}
