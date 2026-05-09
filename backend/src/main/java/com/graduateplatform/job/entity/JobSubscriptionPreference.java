package com.graduateplatform.job.entity;

import com.graduateplatform.common.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_subscription_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSubscriptionPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(length = 500)
    private String cities;

    @Column(length = 500)
    private String industries;

    @Column(length = 500)
    private String roleTypes;

    @Column(length = 120)
    private String salaryRange;

    @Column(length = 500)
    private String companyTypes;

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
