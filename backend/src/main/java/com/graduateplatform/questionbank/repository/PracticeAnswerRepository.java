package com.graduateplatform.questionbank.repository;

import com.graduateplatform.questionbank.entity.PracticeAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PracticeAnswerRepository extends JpaRepository<PracticeAnswer, Long> {
    Optional<PracticeAnswer> findBySessionIdAndQuestionId(Long sessionId, Long questionId);
}
