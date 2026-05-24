package com.example.cabunity.entities;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@ToString
@EqualsAndHashCode
@Entity // השארנו רק את ה-Entity למעלה!
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // התיקון: הוספת הנוסע עם הקישור הנכון בתוך המחלקה!
    @ManyToOne
    @JoinColumn(name = "passenger_id")
    private User passenger;

    private String originAddress;
    private String destinationAddress;
    private double originLat;
    private double originLng;
    private double destLat;
    private double destLng;

    @Enumerated(EnumType.STRING)
    private RideStatus status;

    public enum RideStatus {
        PENDING,
        ACTIVE,
        COMPLETED,
        CANCELLED
    }

    private double price;

    @ManyToOne
    @JoinColumn(name = "ride_group_id")
    private RideGroup rideGroup;
}