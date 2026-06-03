package com.example.cabunity.service;

import com.example.cabunity.entities.LocationLog;
import com.example.cabunity.repositories.LocationLogRep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LocationLogSer {

    private final LocationLogRep locationLogRep;

    // שמירת מיקום חדש (ה-timestamp ייווצר אוטומטית בזכות ה-PrePersist בישות)
    @Transactional
    public LocationLog saveLocation(LocationLog log) {
        return locationLogRep.save(log);
    }

    // שליפת כל הלוגים של נהג מסוים
    public List<LocationLog> getLogsByDriver(Long driverId) {
        return locationLogRep.findByDriverId(driverId);
    }

    // שליפת המיקום האחרון הידוע של נהג (חשוב מאוד למפה בזמן אמת)
    public LocationLog getLastKnownLocation(Long driverId) {
        return locationLogRep.findFirstByDriverIdOrderByTimestampDesc(driverId);
    }

    // שליפת היסטוריה לפי טווח תאריכים
    public List<LocationLog> getDriverHistory(Long driverId, LocalDateTime start, LocalDateTime end) {
        return locationLogRep.findByDriverIdAndTimestampBetween(driverId, start, end);
    }

    // מחיקת היסטוריה ישנה של נהג (לצורך ניקוי בסיס הנתונים)
    @Transactional
    public void deleteLogsByDriver(Long driverId) {
        List<LocationLog> logs = locationLogRep.findByDriverId(driverId);
        locationLogRep.deleteAll(logs);
    }
}