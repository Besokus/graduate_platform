package com.graduateplatform.kaogong.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "civil_service_posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CivilServicePost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String examType;

    private Integer year;

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private String jobName;

    @Column(nullable = false)
    private String recruitingUnit;

    private String unitType;

    private String jobCategory;

    private Integer recruitCount;

    private String educationRequirement;

    private String degreeRequirement;

    @Column(length = 1000)
    private String majorRequirement;

    private String householdRequirement;

    private String politicalStatusRequirement;

    private String examSubjects;

    private LocalDate registrationStart;

    private LocalDate registrationEnd;

    @Column(length = 1000)
    private String sourceUrl;

    @Column(length = 1000)
    private String remark;

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
