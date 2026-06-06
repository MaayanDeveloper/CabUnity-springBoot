package com.example.cabunity.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;
    @Column(name = "start_time")
    private LocalDateTime startTime;
    @Column(name = "end_time")
    private LocalDateTime endTime;
    @Column(name = "optimized_route", columnDefinition = "TEXT")
    private String optimizedRoute;
    @OneToMany(mappedBy = "rideGroup", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Ride> rides;
    private int availableSeats;
    @Enumerated(EnumType.STRING)
    private RideGroupStatus status;

    public enum RideGroupStatus {
        PENDING,     //מוזמן, עוד לא יצא לדרך
        ACTIVE,      // בנסיעה
        COMPLETED    // הסתיימה
    }
}