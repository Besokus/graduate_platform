package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.InterviewScoreLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface InterviewScoreLineRepository extends JpaRepository<InterviewScoreLine, Long>, JpaSpecificationExecutor<InterviewScoreLine> {
    List<InterviewScoreLine> findByActiveTrueOrderByYearDescScoreLineDesc();
    long countByActiveTrue();
}
