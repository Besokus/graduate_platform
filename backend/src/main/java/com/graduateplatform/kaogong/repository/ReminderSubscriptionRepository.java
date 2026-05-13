package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.ReminderSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReminderSubscriptionRepository extends JpaRepository<ReminderSubscription, Long> {
    List<ReminderSubscription> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ReminderSubscription> findByUserIdAndRegionAndExamType(Long userId, String region, String examType);
    List<ReminderSubscription> findByUserIdAndEventId(Long userId, Long eventId);
    List<ReminderSubscription> findByStatus(String status);
}
