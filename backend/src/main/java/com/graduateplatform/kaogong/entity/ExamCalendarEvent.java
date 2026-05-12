package com.graduateplatform.kaogong.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_calendar_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamCalendarEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private String examType;

    private Integer year;

    @Column(nullable = false)
    private String nodeType;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDate eventDate;

    @Column(length = 1000)
    private String description;

    @Column(length = 1000)
    private String sourceUrl;

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
