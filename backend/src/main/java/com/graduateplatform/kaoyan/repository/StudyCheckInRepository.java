package com.graduateplatform.kaoyan.repository;

import com.graduateplatform.kaoyan.entity.StudyCheckIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface StudyCheckInRepository extends JpaRepository<StudyCheckIn, Long> {

    List<StudyCheckIn> findByPlanIdAndUserIdOrderByCheckInDateAsc(Long planId, Long userId);

    List<StudyCheckIn> findByPlanIdAndCheckInDate(Long planId, LocalDate date);

    @Query("SELECT DISTINCT c.checkInDate FROM StudyCheckIn c WHERE c.plan.id = :planId AND c.user.id = :userId AND c.checkInDate BETWEEN :start AND :end")
    List<LocalDate> findDistinctDatesByPlanIdAndUserIdAndDateRange(
        @Param("planId") Long planId,
        @Param("userId") Long userId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(c.durationHours), 0) FROM StudyCheckIn c WHERE c.plan.id = :planId AND c.user.id = :userId")
    java.math.BigDecimal sumDurationHoursByPlanIdAndUserId(
        @Param("planId") Long planId,
        @Param("userId") Long userId);

    Optional<StudyCheckIn> findByIdAndUserId(Long id, Long userId);
}