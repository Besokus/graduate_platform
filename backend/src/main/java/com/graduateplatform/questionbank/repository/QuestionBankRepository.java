package com.graduateplatform.questionbank.repository;

import com.graduateplatform.questionbank.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {
    List<QuestionBank> findByTarget(String target);
}
