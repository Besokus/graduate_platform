package com.graduateplatform.questionbank.entity;

import com.graduateplatform.common.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "practice_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PracticeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false)
    private QuestionBank bank;

    @Column(nullable = false)
    private String mode; // chapter / random / mock

    private String status; // in_progress / submitted

    @Column(nullable = false, updatable = false)
    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private Integer totalCount;

    private Integer correctCount;

    private Integer wrongCount;

    private Integer durationSeconds;

    private Integer score;

    private Integer accuracy;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderNo ASC")
    @Builder.Default
    private List<PracticeAnswer> answers = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "in_progress";
        }
    }
}
