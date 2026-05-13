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
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // כתובת מוצא
    private String originAddress;

    // כתובת יעד
    private String destinationAddress;

    // קואורדינטות מוצא
    private double originLat;

    private double originLng;

    // קואורדינטות יעד
    private double destLat;

    private double destLng;

    // סטטוס נסיעה
    @Enumerated(EnumType.STRING)
    private RideStatus status;

    public enum RideStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }

    // מחיר סופי
    private double price;

    // Ride Sharing
    @ManyToOne
    @JoinColumn(name = "ride_group_id")
    private RideGroup rideGroup;
}