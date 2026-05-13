package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.ExamCalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.time.LocalDate;
import java.util.List;

public interface ExamCalendarEventRepository extends JpaRepository<ExamCalendarEvent, Long>, JpaSpecificationExecutor<ExamCalendarEvent> {
    List<ExamCalendarEvent> findByActiveTrueOrderByEventDateAsc();
    List<ExamCalendarEvent> findByActiveTrueAndEventDateBetween(LocalDate start, LocalDate end);
    long countByActiveTrue();
}
