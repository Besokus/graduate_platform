package com.graduateplatform.studyabroad.entity;

import com.graduateplatform.common.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "study_abroad_experiences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyAbroadExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 40)
    private String country;

    @Column(nullable = false, length = 60)
    private String topic;

    @Column(nullable = false, length = 80)
    private String authorName;

    @Column(nullable = false, length = 20)
    private String readTime;

    @Column(nullable = false, length = 500)
    private String summary;

    @Lob
    @Column(nullable = false, columnDefinition = "LONGTEXT")
    private String content;

    @Column(length = 255)
    private String tags;

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
