package com.graduateplatform.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "posts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 5000)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private PostCategory category;

    @Column(length = 500)
    private String tags; // comma-separated

    @Column(nullable = false)
    private String visibility; // public / members

    @Column(nullable = false)
    private Boolean anonymous = false;

    @Column(nullable = false)
    private Boolean hasAttachment = false;

    @Column(length = 500)
    private String attachmentNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false)
    private String status; // DRAFT / PENDING / PUBLISHED / REJECTED / OFFLINE

    @Builder.Default
    private Integer viewCount = 0;
    @Builder.Default
    private Integer likeCount = 0;
    @Builder.Default
    private Integer favoriteCount = 0;
    @Builder.Default
    private Integer reportCount = 0;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

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

    public int getCommentCount() {
        return comments != null ? comments.size() : 0;
    }
}
