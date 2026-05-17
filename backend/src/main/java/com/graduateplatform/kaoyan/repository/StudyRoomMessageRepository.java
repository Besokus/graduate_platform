package com.graduateplatform.kaoyan.repository;

import com.graduateplatform.kaoyan.entity.StudyRoomMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;

public interface StudyRoomMessageRepository extends JpaRepository<StudyRoomMessage, Long> {

    Page<StudyRoomMessage> findByRoomIdAndCreatedAtGreaterThanOrderByCreatedAtAsc(
            Long roomId, LocalDateTime since, Pageable pageable);

    Page<StudyRoomMessage> findByRoomIdOrderByCreatedAtDesc(Long roomId, Pageable pageable);
}