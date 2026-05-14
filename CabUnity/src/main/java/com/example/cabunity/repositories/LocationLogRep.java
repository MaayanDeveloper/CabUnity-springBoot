package com.example.cabunity.repositories;

import com.example.cabunity.entities.LocationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LocationLogRep extends JpaRepository<LocationLog, Long> {

    // שליפת כל היסטוריית המיקומים של נהג ספציפי
    List<LocationLog> findByDriverId(Long driverId);

    // שליפת המיקומים של נהג מסוים בטווח זמנים (שימושי לדוחות נסיעה)
    List<LocationLog> findByDriverIdAndTimestampBetween(Long driverId, LocalDateTime start, LocalDateTime end);

    // מציאת המיקום האחרון שנרשם לנהג (לצורך מעקב בזמן אמת)
    LocationLog findFirstByDriverIdOrderByTimestampDesc(Long driverId);
}