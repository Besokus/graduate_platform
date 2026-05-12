package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.InterviewFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewFeedbackRepository extends JpaRepository<InterviewFeedback, Long> {
    List<InterviewFeedback> findByRoomIdOrderByCreatedAtDesc(Long roomId);
    Page<InterviewFeedback> findByRoomIdOrderByCreatedAtDesc(Long roomId, Pageable pageable);
    List<InterviewFeedback> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId);
    Page<InterviewFeedback> findByReviewerIdOrderByCreatedAtDesc(Long reviewerId, Pageable pageable);
}
