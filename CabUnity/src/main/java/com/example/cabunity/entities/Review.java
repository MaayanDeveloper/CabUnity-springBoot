package com.example.cabunity.entities;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@ToString
@EqualsAndHashCode
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // foreign key לנסיעה
    @ManyToOne
    @JoinColumn(name = "ride_id")
    private Ride ride;

    // מי שכתב את הביקורת
    @Column(name = "reviewer_id")
    private Long reviewerId;

    // על מי נכתבה הביקורת
    @Column(name = "reviewed_id")
    private Long reviewedId;

    // דירוג מספר (1-5)
    private int rating;

    // הטקסט החופשי
    @Column(columnDefinition = "TEXT")
    private String comment;

    // הציון שנתן ה-AI (חיובי/שלילי)
    @Column(name = "sentiment_score")
    private Double sentimentScore;
}