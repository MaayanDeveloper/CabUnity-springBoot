package com.example.cabunity.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
@ToString(exclude = "rides") // למניעת רקורסיה ב-ToString
@EqualsAndHashCode(exclude = "rides")
@Entity
@Table(name = "ride_groups")
public class RideGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // מקשרת נהג אחד (מטבלת Drivers)
    @Column(name = "driver_id")
    private Long driverId;
    // הערה: אם יש לך מחלקת Driver מסודרת, מומלץ להשתמש ב-ManyToOne במקום ב-Long

    // זמן יציאה
    @Column(name = "start_time")
    private LocalDateTime startTime;

    // תוצר האלגוריתם - סדר איסופים והורדות (נשמר כ-JSON בבסיס הנתונים)
    @Column(name = "optimized_route", columnDefinition = "TEXT")
    private String optimizedRoute;

    // קשר של אחד לרבים עם טבלת הנסיעות (Rides)
    @OneToMany(mappedBy = "rideGroup", cascade = CascadeType.ALL)
    private List<Ride> rides;
}