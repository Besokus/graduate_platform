package com.graduateplatform.job.repository;

import com.graduateplatform.job.entity.JobSubscriptionPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobSubscriptionPreferenceRepository extends JpaRepository<JobSubscriptionPreference, Long> {
    Optional<JobSubscriptionPreference> findByUserId(Long userId);
    List<JobSubscriptionPreference> findByActiveTrue();
}
