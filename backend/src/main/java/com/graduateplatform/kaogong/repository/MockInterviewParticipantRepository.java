package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.MockInterviewParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MockInterviewParticipantRepository extends JpaRepository<MockInterviewParticipant, Long> {
    List<MockInterviewParticipant> findByRoomId(Long roomId);
    List<MockInterviewParticipant> findByUserIdOrderByJoinedAtDesc(Long userId);
    Page<MockInterviewParticipant> findByUserIdOrderByJoinedAtDesc(Long userId, Pageable pageable);
    boolean existsByRoomIdAndUserId(Long roomId, Long userId);
}
