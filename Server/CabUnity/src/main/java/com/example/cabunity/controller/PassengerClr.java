package com.example.cabunity.controller;

import com.example.cabunity.dto.CreateRideRequest;
import com.example.cabunity.entities.Ride;
import com.example.cabunity.entities.RideGroup;
import com.example.cabunity.entities.User;
import com.example.cabunity.service.RideGroupSer;
import com.example.cabunity.service.RideSer;
import com.example.cabunity.service.UserSer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;

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

    // 1.ב. התחברות נוסע/משתמש למערכת והנפקת טוקן אמיתי
    @Autowired
    private com.example.cabunity.service.JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<?> loginPassenger(@RequestBody com.example.cabunity.dto.LoginRequest loginRequest) {
        // 1. חיפוש המשתמש לפי האימייל שלו
        User user = userSer.getAllUsers().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(loginRequest.getEmail()))
                .findFirst()
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("האימייל לא נמצא במערכת");
        }

        // 2. בדיקת סיסמה ישירה מול הנתונים בדאטאבייס
        if (!user.getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("אימייל או סיסמה שגויים, נסו שוב.");
        }

        // 3. יצירת JWT Token אמיתי, חתום ורשמי - מעבירים את אובייקט ה-User המלא!
        String token = jwtService.generateToken(user);

        // 4. החזרת התשובה הרשמית עם ה-JWT לפרונט
        return ResponseEntity.ok(new com.example.cabunity.dto.LoginResponse(token, user));
    }
    // 4. הפעלת מנוע השידוך החכם! (האלגוריתם שכתבנו יחד)
    @PostMapping("/rides/{rideId}/match")
    public ResponseEntity<Map<String, String>> matchRideToGroup(@PathVariable Long rideId) {
        try {
            RideGroup matchedGroup =
                    rideGroupSer.matchRideToBestGroup(rideId);
            return ResponseEntity.ok(Map.of(
                    "message", "Passenger matched successfully to the best available driver!",
                    "rideGroupId", String.valueOf(matchedGroup.getId()),
                    "driverId", String.valueOf(matchedGroup.getDriver().getId())
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        }
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

    @PostMapping("/{passengerId}/rides")
    public ResponseEntity<Ride> createRide(
            @PathVariable Long passengerId,
            @RequestBody CreateRideRequest request
    ) {

        Ride ride = Ride.builder()
                .originAddress(request.getOriginAddress())
                .destinationAddress(request.getDestinationAddress())
                .originLat(request.getOriginLat())
                .originLng(request.getOriginLng())
                .destLat(request.getDestLat())
                .destLng(request.getDestLng())
                .requestedSeats(request.getRequestedSeats())
                .isShared(request.isShared())
                .build();

        Ride createdRide = rideSer.createRide(ride, passengerId);

        return ResponseEntity.ok(createdRide);
    }

    @PostMapping("/rides/{rideId}/complete")
    public ResponseEntity<?> completeRide(@PathVariable Long rideId) {
        rideSer.completeRide(rideId);

        return ResponseEntity.ok(Map.of(
                "message", "Ride completed successfully"
        ));
    }
}
