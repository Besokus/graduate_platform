package com.graduateplatform.kaogong.repository;

import com.graduateplatform.kaogong.entity.CivilServicePost;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CivilServicePostRepository extends JpaRepository<CivilServicePost, Long>, JpaSpecificationExecutor<CivilServicePost> {
    List<CivilServicePost> findByActiveTrueOrderByRegistrationEndAsc();
    long countByActiveTrue();
}
