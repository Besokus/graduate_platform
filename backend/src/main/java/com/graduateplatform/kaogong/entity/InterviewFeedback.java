package com.graduateplatform.kaogong.entity;


import com.graduateplatform.common.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interview_feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private MockInterviewRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Column(length = 1000)
    private String strengths;

    @Column(length = 1000)
    private String problems;

    @Column(length = 1000)
    private String suggestions;

    @Column(length = 1000)
    private String attachmentNote;

    private Integer score;

    private Integer expressionScore;

    private Integer logicScore;

    private Integer etiquetteScore;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
