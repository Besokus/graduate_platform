package com.graduateplatform.kaoyan.entity;

import com.graduateplatform.common.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_room_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudyRoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private StudyRoom room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    private LocalDateTime leftAt;

    @Column(name = "total_duration_seconds")
    @Builder.Default
    private Long totalDurationSeconds = 0L;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}