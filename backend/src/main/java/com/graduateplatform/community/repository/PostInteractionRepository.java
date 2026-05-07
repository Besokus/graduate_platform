package com.graduateplatform.community.repository;

import com.graduateplatform.community.entity.PostInteraction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostInteractionRepository extends JpaRepository<PostInteraction, Long> {
    Optional<PostInteraction> findByPostIdAndUserIdAndType(Long postId, Long userId, String type);
    long countByPostIdAndType(Long postId, String type);
}
