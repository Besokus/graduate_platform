package com.graduateplatform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "post_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // kaoyan / kaogong / job / liuxue / experience / resource

    @Column(nullable = false)
    private String name;

    private String description;

    private Integer sortOrder = 0;

    private Boolean active = true;
}
