package com.graduateplatform.repository;

import com.graduateplatform.entity.PostCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PostCategoryRepository extends JpaRepository<PostCategory, Long> {
    Optional<PostCategory> findByCode(String code);
}
