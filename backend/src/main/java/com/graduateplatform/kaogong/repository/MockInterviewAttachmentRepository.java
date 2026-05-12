package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.MockInterviewAttachment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MockInterviewAttachmentRepository extends JpaRepository<MockInterviewAttachment, Long> {
    List<MockInterviewAttachment> findByRoomIdOrderByCreatedAtDesc(Long roomId);
    Page<MockInterviewAttachment> findByRoomIdOrderByCreatedAtDesc(Long roomId, Pageable pageable);
}
