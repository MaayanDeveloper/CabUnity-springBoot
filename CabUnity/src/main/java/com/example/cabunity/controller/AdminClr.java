package com.example.cabunity.controller;

import com.example.cabunity.entities.Driver;
import com.example.cabunity.entities.LocationLog;
import com.example.cabunity.entities.Ride;
import com.example.cabunity.entities.User;
import com.example.cabunity.service.DriverSer;
import com.example.cabunity.service.LocationLogSer;
import com.example.cabunity.service.RideSer;
import com.example.cabunity.service.UserSer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminClr {

    private final UserSer userSer;
    private final DriverSer driverSer;
    private final RideSer rideSer;
    private final LocationLogSer locationLogSer;

    // 1. שליפת כל המשתמשים הרשומים במערכת
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userSer.getAllUsers());
    }

    // 2. שליפת כל הנהגים במערכת
    @GetMapping("/drivers")
    public ResponseEntity<List<Driver>> getAllDrivers() {
        return ResponseEntity.ok(driverSer.getAllDrivers());
    }

    // 3. שליפת נהגים שממתינים לאישור המנהל כדי להציג בדשבורד
    @GetMapping("/drivers/pending")
    public ResponseEntity<List<Driver>> getPendingDrivers() {
        return ResponseEntity.ok(driverSer.getPendingDrivers());
    }

    // 4. אישור או דחייה של נהג (אם מאושר, ה-Role שלו משתנה אוטומטית ל-DRIVER)
    @PutMapping("/drivers/{driverId}/approve")
    public ResponseEntity<Driver> approveDriver(@PathVariable Long driverId, @RequestParam boolean isApproved) {
        Driver updatedDriver = driverSer.approveDriver(driverId, isApproved);
        return ResponseEntity.ok(updatedDriver);
    }

    // 5. שליפת כל הנסיעות שמחכות כרגע לשידוך במערכת
    @GetMapping("/rides/pending")
    public ResponseEntity<List<Ride>> getPendingRides() {
        return ResponseEntity.ok(rideSer.getPendingRides());
    }

    // 6. עדכון דירוג של משתמש באופן ידני על ידי המנהל (למשל במקרה של תלונה)
    @PutMapping("/users/{userId}/rating")
    public ResponseEntity<String> updateUserRating(@PathVariable Long userId, @RequestParam double rating) {
        userSer.updateUserRating(userId, rating);
        return ResponseEntity.ok("User rating updated by admin.");
    }

    // 7. מחיקת משתמש מהמערכת לצמיתות
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {
        userSer.deleteUser(userId);
        return ResponseEntity.ok("User deleted successfully from CabUnity.");
    }

    // 8. שליפת היסטוריית הלוגים הגיאוגרפיים של נהג ספציפי לצפייה במפת המנהל
    @GetMapping("/drivers/{driverId}/location-logs")
    public ResponseEntity<List<LocationLog>> getDriverLocationLogs(@PathVariable Long driverId) {
        return ResponseEntity.ok(locationLogSer.getLogsByDriver(driverId));
    }

    // 9. ניקוי בסיס הנתונים מלוגים ישנים של נהג מסוים
    @DeleteMapping("/drivers/{driverId}/location-logs")
    public ResponseEntity<String> deleteDriverLogs(@PathVariable Long driverId) {
        locationLogSer.deleteLogsByDriver(driverId);
        return ResponseEntity.ok("Location logs cleared for driver: " + driverId);
    }
}