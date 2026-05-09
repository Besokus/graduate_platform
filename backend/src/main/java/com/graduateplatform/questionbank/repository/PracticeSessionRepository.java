package com.graduateplatform.questionbank.repository;

import com.graduateplatform.questionbank.entity.PracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PracticeSessionRepository extends JpaRepository<PracticeSession, Long> {
    List<PracticeSession> findByUserIdAndStatusOrderBySubmittedAtDesc(Long userId, String status);
}
