package com.example.cabunity.service;

import com.example.cabunity.entities.Ride;
import com.example.cabunity.entities.RideGroup;
import com.example.cabunity.entities.User;
import com.example.cabunity.repositories.RideRep;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RideSer {
    private final RideRep rideRepository;
    private final UserSer userSer;

    @Transactional
    public Ride createRide(Ride ride, Long passengerId) {
        User passenger = userSer.getUserById(passengerId);
        ride.setPassenger(passenger);
        ride.setStatus(Ride.RideStatus.PENDING);
        ride.setPrice(50.0); // מעיין- בהמשך לזכור להחליף מחיר ע"פ אלגוריתם
        ride.setRideGroup(null);
        return rideRepository.save(ride);
    }

    // 2 שליפת נסיעה ספציפית לפי ה-ID שלה
    public Ride getRideById(Long id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ride not found with id: " + id));
    }

    //  שליפת כל הנסיעות שמחכות כרגע לשידוך (בשביל האלגוריתם שלכן!)
    public List<Ride> getPendingRides() {
        return rideRepository.findByStatus(Ride.RideStatus.PENDING);
        // (ודאי שתוסיפי את findByStatus ב-RideRep שלך)
    }
   // היסטוריית נסיעות עבור נוסע ספציפי (כדי להציג לו בריאקט "הנסיעות שלי")
    public List<Ride> getRidesByPassenger(Long passengerId) {
        return rideRepository.findByPassengerId(passengerId);
        // (ודאי שתוסיפי את findByPassengerId ב-RideRep שלך)
    }

    //עדכון סטטוס הנסיעה (כשהנהג אוסף את הנוסע ל-ACTIVE או מגיע ליעד ל-COMPLETED)
    @Transactional
    public Ride updateRideStatus(Long rideId, Ride.RideStatus newStatus) {
        // שולפים את הנסיעה מה-DB
        Ride ride = getRideById(rideId);

        // מעדכנים את הסטטוס החדש שקיבלנו מהנהג
        ride.setStatus(newStatus);

        // לא נוגעים כאן במקומות ישיבה! המקום כבר שוריין מראש בשלב השידוך (האלגוריתם)
        return rideRepository.save(ride);
    }

    @Transactional
    public Ride cancelRide(Long rideId) {
        // שולפים את הנסיעה מה-DB
        Ride ride = getRideById(rideId);

        // משנים את הסטטוס ל-CANCELLED
        ride.setStatus(Ride.RideStatus.CANCELLED);
        if (ride.getRideGroup() != null) {
            RideGroup group = ride.getRideGroup();
            group.setAvailableSeats(group.getAvailableSeats() + 1);
        }
        return rideRepository.save(ride);
    }
}
