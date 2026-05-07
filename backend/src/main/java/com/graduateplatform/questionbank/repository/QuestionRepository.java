package com.graduateplatform.questionbank.repository;

import com.graduateplatform.questionbank.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByBankId(Long bankId);
}
