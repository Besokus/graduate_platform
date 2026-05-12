package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.NotificationMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationMessageRepository extends JpaRepository<NotificationMessage, Long> {
    List<NotificationMessage> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndSourceTypeAndSourceId(Long userId, String sourceType, Long sourceId);
}
