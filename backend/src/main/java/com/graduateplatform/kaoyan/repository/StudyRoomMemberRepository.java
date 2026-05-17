package com.graduateplatform.kaoyan.repository;

import com.graduateplatform.kaoyan.entity.StudyRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface StudyRoomMemberRepository extends JpaRepository<StudyRoomMember, Long> {

    Optional<StudyRoomMember> findByRoomIdAndUserId(Long roomId, Long userId);

    Optional<StudyRoomMember> findByRoomIdAndUserIdAndLeftAtIsNull(Long roomId, Long userId);

    List<StudyRoomMember> findByRoomIdAndLeftAtIsNull(Long roomId);

    List<StudyRoomMember> findByRoomId(Long roomId);

    @Query("SELECT m FROM StudyRoomMember m WHERE m.user.id = :userId AND m.leftAt IS NULL")
    Optional<StudyRoomMember> findCurrentMembership(@Param("userId") Long userId);

    @Query("SELECT m FROM StudyRoomMember m WHERE m.user.id = :userId AND m.leftAt IS NULL ORDER BY m.joinedAt DESC")
    List<StudyRoomMember> findCurrentMemberships(@Param("userId") Long userId);

    @Query("SELECT m FROM StudyRoomMember m WHERE m.user.id = :userId AND m.leftAt IS NULL AND m.room.id = :roomId")
    Optional<StudyRoomMember> findCurrentMembershipInRoom(@Param("userId") Long userId, @Param("roomId") Long roomId);

    boolean existsByRoomIdAndUserIdAndLeftAtIsNull(Long roomId, Long userId);
}