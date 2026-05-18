package com.graduateplatform.kaoyan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "graduate_schools")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraduateSchool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String region;
    private String province;

    @Builder.Default
    private Boolean is985 = false;

    @Builder.Default
    private Boolean is211 = false;

    @Builder.Default
    private Boolean isDoubleFirstClass = false;

    private String schoolType;
    private String logoUrl;

    @Column(length = 2000)
    private String description;

    private String officialSite;

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