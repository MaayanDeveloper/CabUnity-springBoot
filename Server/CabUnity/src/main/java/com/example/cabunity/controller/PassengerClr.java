package com.example.cabunity.controller;

import com.example.cabunity.entities.Ride;
import com.example.cabunity.entities.User;
import com.example.cabunity.service.RideGroupSer;
import com.example.cabunity.service.RideSer;
import com.example.cabunity.service.UserSer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passenger")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PassengerClr {
    private final UserSer userSer;
    private final RideSer rideSer;
    private final RideGroupSer rideGroupSer;

    // 1. הרשמת משתמש/נוסע חדש למערכת
    @PostMapping("/register")
    public ResponseEntity<User> registerPassenger(@RequestBody User user) {
        User created = userSer.createUser(user);
        return ResponseEntity.ok(created);
    }

    // 2. עדכון פרטי הפרופיל של הנוסע
    @PutMapping("/{id}/update")
    public ResponseEntity<User> updatePassenger(@PathVariable Long id, @RequestBody User userDetails) {
        User updated = userSer.updateUser(id, userDetails);
        return ResponseEntity.ok(updated);
    }
    // 3. יצירת הזמנת נסיעה חדשה (בסטטוס PENDING)
    @PostMapping("/{passengerId}/rides")
    public ResponseEntity<Ride> createRide(@RequestBody Ride ride, @PathVariable Long passengerId) {
        System.out.println("ENTERED CREATE RIDE");
        System.out.println(ride);
        Ride createdRide = rideSer.createRide(ride, passengerId);
        return ResponseEntity.ok(createdRide);
    }

    // 4. הפעלת מנוע השידוך החכם! (האלגוריתם שכתבנו יחד)
    @PostMapping("/rides/{rideId}/match")
    public ResponseEntity<String> matchRideToGroup(@PathVariable Long rideId) {
        rideGroupSer.matchRideToBestGroup(rideId);
        return ResponseEntity.ok("Passenger matched successfully to the best available driver!");
    }

    // 5. צפייה בהיסטוריית הנסיעות של הנוסע הספציפי ("הנסיעות שלי" בריאקט)
    @GetMapping("/{passengerId}/history")
    public ResponseEntity<List<Ride>> getPassengerHistory(@PathVariable Long passengerId) {
        List<Ride> history = rideSer.getRidesByPassenger(passengerId);
        return ResponseEntity.ok(history);
    }

    // 6. ביטול נסיעה על ידי הנוסע (משחרר מושב במונית אם שודך)
    @PutMapping("/rides/{rideId}/cancel")
    public ResponseEntity<Ride> cancelRide(@PathVariable Long rideId) {
        Ride cancelledRide = rideSer.cancelRide(rideId);
        return ResponseEntity.ok(cancelledRide);
    }

    // 7. שליפת פרטי נסיעה ספציפית (למשל כדי שהנוסע יראה על המפה מי הנהג שלו)
    @GetMapping("/rides/{rideId}")
    public ResponseEntity<Ride> getRideDetails(@PathVariable Long rideId) {
        Ride ride = rideSer.getRideById(rideId);
        return ResponseEntity.ok(ride);
    }
}
