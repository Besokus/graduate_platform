package com.graduateplatform.repository;

import com.graduateplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmail(String email);
    Optional<User> findByStudentId(String studentId);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
    boolean existsByStudentId(String studentId);
}
