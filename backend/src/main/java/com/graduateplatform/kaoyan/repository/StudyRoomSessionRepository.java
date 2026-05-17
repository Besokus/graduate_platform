package com.graduateplatform.kaoyan.repository;

import com.graduateplatform.kaoyan.entity.StudyRoomSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Optional;

public interface StudyRoomSessionRepository extends JpaRepository<StudyRoomSession, Long> {

    Optional<StudyRoomSession> findByUserIdAndRoomIdAndEndedAtIsNull(Long userId, Long roomId);

    @Query("SELECT COALESCE(SUM(s.durationSeconds), 0) FROM StudyRoomSession s " +
           "WHERE s.user.id = :userId AND s.room.id = :roomId AND s.startedAt >= :since")
    Long sumDurationSecondsSince(@Param("userId") Long userId,
                                  @Param("roomId") Long roomId,
                                  @Param("since") LocalDateTime since);

    @Query("SELECT COALESCE(SUM(s.durationSeconds), 0) FROM StudyRoomSession s " +
           "WHERE s.user.id = :userId AND s.room.id = :roomId")
    Long sumTotalDurationSeconds(@Param("userId") Long userId, @Param("roomId") Long roomId);
}