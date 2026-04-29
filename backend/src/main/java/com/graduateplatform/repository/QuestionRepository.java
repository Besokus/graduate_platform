package com.graduateplatform.repository;

import com.graduateplatform.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByBankId(Long bankId);
}
