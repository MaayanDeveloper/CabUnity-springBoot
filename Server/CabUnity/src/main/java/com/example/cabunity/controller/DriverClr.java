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

import java.util.Map;

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
    @PostMapping("/api/driver/{id}/location")
    public ResponseEntity<String> updateLocation(
            @PathVariable Long id,
            @RequestBody Map<String, Double> body) {
        double lat = body.get("lat");
        double lng = body.get("lng");
        driverSer.updateDriverLocation(id, lat, lng);
        return ResponseEntity.ok("updated");
    }

    // 5. עדכון סטטוס קבוצת הנסיעה (למשל כשהנהג יוצא לדרך משנה ל-ACTIVE)
    @PutMapping("/groups/{groupId}/status")
    public ResponseEntity<RideGroup> updateGroupStatus(
            @PathVariable Long groupId,
            @RequestParam RideGroup.RideGroupStatus status) {
        RideGroup updatedGroup =
                rideGroupSer.updateGroupStatus(groupId, status);
        return ResponseEntity.ok(updatedGroup);
    }

    //הגעתי לפה
    // 6. עדכון סטטוס נסיעה של נוסע ספציפי (למשל ACTIVE כשהוא עלה לאוטו, COMPLETED כשהגיע ליעד)
    @PutMapping("/rides/{rideId}/status")
    public ResponseEntity<Ride> updatePassengerRideStatus(
            @PathVariable Long rideId,
            @RequestParam Ride.RideStatus status) {
        Ride updatedRide = rideSer.updateRideStatus(rideId, status);
        return ResponseEntity.ok(updatedRide);
    }
    //סיום משמרת
    @PutMapping("/shift/{groupId}/end")
    public ResponseEntity<RideGroup> endShift(@PathVariable Long groupId) {
        RideGroup group = rideGroupSer.endShift(groupId);
        return ResponseEntity.ok(group);
    }
    @PutMapping("/{rideId}/status")
    public ResponseEntity<Ride> updateStatus(
            @PathVariable Long rideId,
            @RequestParam Ride.RideStatus status
    ) {
        return ResponseEntity.ok(
                rideSer.updateRideStatus(rideId, status)
        );
    }
}