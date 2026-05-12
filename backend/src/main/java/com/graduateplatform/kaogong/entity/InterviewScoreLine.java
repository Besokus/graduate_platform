package com.graduateplatform.kaogong.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_score_lines")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewScoreLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String region;

    private Integer year;

    private String examType;

    private String unitType;

    private String jobCategory;

    private String jobName;

    private String recruitingUnit;

    @Column(precision = 6, scale = 2)
    private BigDecimal scoreLine;

    private String interviewRatio;

    private Integer recruitCount;

    private Integer interviewCount;

    @Column(length = 1000)
    private String dataNote;

    @Column(length = 1000)
    private String source;

    @Builder.Default
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
