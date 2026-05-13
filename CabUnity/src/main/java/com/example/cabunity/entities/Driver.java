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
public class Driver{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign Key ל-Users
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    // דגם הרכב
    private String carModel;

    // מספר רכב
    private String licensePlate;

    // מיקום נוכחי
    private double currentLat;

    private double currentLng;

    // האם הנהג זמין לנסיעות
    private boolean isAvailable;
}