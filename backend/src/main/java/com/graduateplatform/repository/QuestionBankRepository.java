package com.graduateplatform.repository;

import com.graduateplatform.entity.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {
    List<QuestionBank> findByTarget(String target);
}
