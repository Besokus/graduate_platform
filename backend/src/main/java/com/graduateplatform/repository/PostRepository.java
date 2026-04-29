package com.graduateplatform.repository;

import com.graduateplatform.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' " +
           "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
           "AND (:keyword IS NULL OR p.title LIKE %:keyword% OR p.content LIKE %:keyword%) " +
           "AND (:tag IS NULL OR p.tags LIKE %:tag%) " +
           "AND (:hasAttachment IS NULL OR p.hasAttachment = :hasAttachment)")
    Page<Post> findPublishedPosts(
        @Param("categoryId") Long categoryId,
        @Param("keyword") String keyword,
        @Param("tag") String tag,
        @Param("hasAttachment") Boolean hasAttachment,
        Pageable pageable
    );

    long countByAuthorId(Long authorId);

    Page<Post> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
