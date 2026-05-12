package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.MockInterviewMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MockInterviewMessageRepository extends JpaRepository<MockInterviewMessage, Long> {
    List<MockInterviewMessage> findByRoomIdOrderByCreatedAtAsc(Long roomId);
    Page<MockInterviewMessage> findByRoomIdOrderByCreatedAtAsc(Long roomId, Pageable pageable);
}
