package com.graduateplatform.kaoyan.repository;

import com.graduateplatform.kaoyan.entity.GraduateScoreLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface GraduateScoreLineRepository extends JpaRepository<GraduateScoreLine, Long>, JpaSpecificationExecutor<GraduateScoreLine> {
    List<GraduateScoreLine> findByActiveTrueOrderByYearDesc();
}