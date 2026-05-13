package com.graduateplatform.kaogong.entity;


import com.graduateplatform.common.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminder_subscriptions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReminderSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private String examType;

    private Integer examYear;

    private Long eventId;

    @Builder.Default
    private Integer remindBeforeDays = 3;

    @Builder.Default
    private Boolean siteMessage = true;

    @Builder.Default
    private Boolean email = false;

    @Builder.Default
    private Boolean sms = false;

    @Column(nullable = false)
    private String status;

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
