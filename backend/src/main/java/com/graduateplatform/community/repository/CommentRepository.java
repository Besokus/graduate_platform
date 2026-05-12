package com.graduateplatform.community.repository;

import com.graduateplatform.community.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPostIdOrderByCreatedAtAsc(Long postId);
    List<Comment> findByPostIdAndStatusOrderByCreatedAtAsc(Long postId, String status);
    long countByAuthorId(Long authorId);
    Page<Comment> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);
    Optional<Comment> findByIdAndAuthorId(Long id, Long authorId);
}
