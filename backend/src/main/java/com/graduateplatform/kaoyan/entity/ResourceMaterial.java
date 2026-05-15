package com.graduateplatform.kaoyan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resource_materials")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long uploaderId;

    @Column(nullable = false, length = 50)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(length = 100)
    private String school;

    @Column(length = 100)
    private String major;

    @Column(length = 50)
    private String subject;

    private Integer year;

    @Column(length = 20)
    private String materialType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MaterialStatus status = MaterialStatus.PENDING;

    @Builder.Default
    private Integer viewCount = 0;

    @Builder.Default
    private Integer downloadCount = 0;

    @Builder.Default
    private Boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "material", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MaterialAttachment> attachments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addAttachment(MaterialAttachment attachment) {
        attachments.add(attachment);
        attachment.setMaterial(this);
    }
}