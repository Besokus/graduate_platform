package com.graduateplatform.job.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "career_fairs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerFair {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 120)
    private String companyName;

    @Column(length = 80)
    private String city;

    @Column(length = 80)
    private String industry;

    @Column(length = 500)
    private String targetRoles;

    @Column(length = 200)
    private String location;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime applyDeadline;

    @Column(length = 500)
    private String applyUrl;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

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
