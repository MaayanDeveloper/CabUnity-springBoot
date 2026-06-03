package com.example.cabunity.controller;

import com.example.cabunity.entities.Driver;
import com.example.cabunity.entities.LocationLog;
import com.example.cabunity.entities.Ride;
import com.example.cabunity.entities.RideGroup;
import com.example.cabunity.service.DriverSer;
import com.example.cabunity.service.LocationLogSer;
import com.example.cabunity.service.RideGroupSer;
import com.example.cabunity.service.RideSer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverClr {

    private final DriverSer driverSer;
    private final RideGroupSer rideGroupSer;
    private final RideSer rideSer;
    private final LocationLogSer locationLogSer;

    // 1. הגשת בקשה של משתמש להפוך לנהג (סטטוס PENDING של המנהל)
    @PostMapping("/register/{userId}")
    public ResponseEntity<Driver> registerAsDriver(@RequestBody Driver driver, @PathVariable Long userId) {
        Driver registered = driverSer.registerDriver(driver, userId);
        return ResponseEntity.ok(registered);
    }

    // 2. תחילת משמרת - יצירת קבוצת נסיעה חדשה לקבלת נוסעים
    @PostMapping("/{driverId}/start-shift")
    public ResponseEntity<RideGroup> startShift(@PathVariable Long driverId) {
        RideGroup newGroup = rideGroupSer.createRideGroup(driverId);
        return ResponseEntity.ok(newGroup);
    }

    // 3. שינוי מצב זמינות (פנוי/עסוק) במהלך המשמרת
    @PutMapping("/{driverId}/availability")
    public ResponseEntity<String> changeAvailability(@PathVariable Long driverId, @RequestParam boolean isAvailable) {
        driverSer.Availability(driverId, isAvailable);
        return ResponseEntity.ok("Driver availability updated to: " + isAvailable);
    }

    // 4. עדכון מיקום הנהג בזמן אמת ושמירת לוג היסטורי
    @PostMapping("/{driverId}/location")
    public ResponseEntity<String> updateLocation(
            @PathVariable Long driverId,
            @RequestParam double lat,
            @RequestParam double lng) {

        // א) מעדכנים את המיקום הנוכחי על כרטיס הנהג
        driverSer.updateDriverLocation(driverId, lat, lng);

        // ב) שומרים בלוג בשביל המפה והיסטוריית הנסיעה של חיה
        LocationLog log = new LocationLog();

        // התיקון המדויק לפי הקוד של חיה:
        log.setDriverId(driverId); // מעבירים את ה-ID (המספר) כמו שחיה הגדירה!
        log.setLat(lat);           // משתמשים ב-lat במקום latitude
        log.setLng(lng);           // משתמשים ב-lng במקום longitude

        locationLogSer.saveLocation(log);

        return ResponseEntity.ok("Location updated and logged successfully.");
    }

    // 5. עדכון סטטוס קבוצת הנסיעה (למשל כשהנהג יוצא לדרך משנה ל-ACTIVE)
    @PutMapping("/groups/{groupId}/status")
    public ResponseEntity<RideGroup> updateGroupStatus(
            @PathVariable Long groupId,
            @RequestParam RideGroup.RideGroupStatus status) {
        RideGroup updatedGroup = rideGroupSer.updateGroupStatus(groupId, status);
        return ResponseEntity.ok(updatedGroup);
    }

    // 6. עדכון סטטוס נסיעה של נוסע ספציפי (למשל ACTIVE כשהוא עלה לאוטו, COMPLETED כשהגיע ליעד)
    @PutMapping("/rides/{rideId}/status")
    public ResponseEntity<Ride> updatePassengerRideStatus(
            @PathVariable Long rideId,
            @RequestParam Ride.RideStatus status) {
        Ride updatedRide = rideSer.updateRideStatus(rideId, status);
        return ResponseEntity.ok(updatedRide);
    }
}