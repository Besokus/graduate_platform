package com.graduateplatform.kaoyan.repository;

import com.graduateplatform.kaoyan.entity.StudyRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StudyRoomRepository extends JpaRepository<StudyRoom, Long>, JpaSpecificationExecutor<StudyRoom> {

    List<StudyRoom> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    Page<StudyRoom> findByStatus(StudyRoom.Status status, Pageable pageable);

    @Query("SELECT r FROM StudyRoom r WHERE r.status = :status " +
           "AND (:schoolId IS NULL OR r.school.id = :schoolId) " +
           "AND (:major IS NULL OR r.major LIKE %:major%)")
    Page<StudyRoom> findByFilters(@Param("status") StudyRoom.Status status,
                                   @Param("schoolId") Long schoolId,
                                   @Param("major") String major,
                                   Pageable pageable);

    @Query("SELECT COUNT(r) FROM StudyRoom r WHERE r.createdBy.id = :userId")
    long countByCreatedByUserId(@Param("userId") Long userId);

    Optional<StudyRoom> findByIdAndStatus(Long id, StudyRoom.Status status);
}