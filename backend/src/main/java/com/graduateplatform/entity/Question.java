package com.graduateplatform.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String stem;

    @Column(nullable = false, length = 2000)
    private String optionsJson; // JSON array string: ["A.xxx","B.xxx","C.xxx","D.xxx"]

    @Column(nullable = false)
    private String answer; // A / B / C / D

    @Column(length = 2000)
    private String analysis;

    private String chapter;

    private String difficulty; // easy / middle / hard

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_id", nullable = false)
    private QuestionBank bank;

    private Boolean active = true;
}
