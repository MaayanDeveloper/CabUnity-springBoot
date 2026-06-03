package com.example.cabunity.repositories;

import com.example.cabunity.entities.Driver;
import com.example.cabunity.entities.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RideRep extends JpaRepository<Ride, Long> {
    // מוצא את כל הנסיעות לפי הסטטוס שלהן (למשל PENDING)
    List<Ride> findByStatus(Ride.RideStatus status);

    // מוצא את כל הנסיעות ששייכות לנוסע ספציפי לפי ה-ID שלו
    List<Ride> findByPassengerId(Long passengerId);
}
