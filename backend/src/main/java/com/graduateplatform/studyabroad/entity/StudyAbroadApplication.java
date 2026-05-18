package com.graduateplatform.studyabroad.entity;

import com.graduateplatform.common.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_abroad_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyAbroadApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 40)
    private String country;

    @Column(nullable = false, length = 120)
    private String school;

    @Column(nullable = false, length = 120)
    private String program;

    @Column(nullable = false, length = 40)
    private String degree;

    @Column(nullable = false, length = 40)
    private String intake;

    @Column(nullable = false, length = 40)
    private String applicationRound;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false, length = 20)
    private String priority;

    @Column(length = 500)
    private String note;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
