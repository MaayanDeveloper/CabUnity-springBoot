package com.example.cabunity.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@ToString
@EqualsAndHashCode
@Entity
@Table(name = "location_logs")
public class LocationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Foreign Key לנהג
    @Column(name = "driver_id")
    private Long driverId;

    // קואורדינטות מיקום
    private double lat;

    private double lng;

    // זמן התיעוד (Timestamp)
    private LocalDateTime timestamp;

    // אופציונלי: יצירת timestamp אוטומטי בעת השמירה
    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}