    package com.example.cabunity.entities;

    import com.fasterxml.jackson.annotation.JsonBackReference;
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
        // התיקון: הוספת הנוסע עם הקישור הנכון בתוך המחלקה!
        @ManyToOne
        @JoinColumn(name = "passenger_id")
        private User passenger;

        private String originAddress; //מיקום
        private String destinationAddress; // יעד
        private double originLat; //מיקום קווי רוחב
        private double originLng; // מיקום קווי אורך
        private double destLat; //יעד קווי רוחב
        private double destLng; // יעד קווי אורך
        private int requestedSeats; // כמה מקומות הנוסע ביקש (1, 2, 3 וכו')
        @Enumerated(EnumType.STRING)
        private RideStatus status;

        public enum RideStatus {
            PENDING,
            ACTIVE,
            COMPLETED,
            CANCELLED
        }
        private boolean isShared;
        private double price;

        @ManyToOne
        @JoinColumn(name = "ride_group_id")
        @JsonBackReference
        private RideGroup rideGroup;
    }