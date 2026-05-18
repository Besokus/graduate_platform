package com.graduateplatform.kaoyan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "graduate_score_lines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraduateScoreLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private GraduateSchool school;

    private Integer year;

    private String majorCategory;
    private String majorName;
    private String degreeType;

    @Builder.Default
    private Boolean isNationalLine = false;

    @Column(precision = 6, scale = 2)
    private BigDecimal politicsLine;

    @Column(precision = 6, scale = 2)
    private BigDecimal foreignLangLine;

    @Column(name = "subject1_line", precision = 6, scale = 2)
    private BigDecimal subject1Line;

    @Column(name = "subject2_line", precision = 6, scale = 2)
    private BigDecimal subject2Line;

    @Column(precision = 6, scale = 2)
    private BigDecimal totalScoreLine;

    private Integer plannedEnrollment;
    private Integer actualApplicants;

    @Column(precision = 6, scale = 2)
    private BigDecimal admissionRatio;

    @Column(length = 1000)
    private String note;

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