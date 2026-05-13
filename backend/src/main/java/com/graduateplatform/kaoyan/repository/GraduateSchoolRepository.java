package com.graduateplatform.kaoyan.repository;

import com.graduateplatform.kaoyan.entity.GraduateSchool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface GraduateSchoolRepository extends JpaRepository<GraduateSchool, Long>, JpaSpecificationExecutor<GraduateSchool> {
    List<GraduateSchool> findByActiveTrueOrderByNameAsc();
}