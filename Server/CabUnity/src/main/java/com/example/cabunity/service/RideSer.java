package com.example.cabunity.service;

import com.example.cabunity.entities.Driver;
import com.example.cabunity.entities.Ride;
import com.example.cabunity.entities.RideGroup;
import com.example.cabunity.entities.User;
import com.example.cabunity.repositories.RideGroupRep;
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
    private final RideGroupRep rideGroupRepository;

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

    @Transactional
    public Ride cancelRide(Long rideId) {
        // שולפים את הנסיעה מה-DB
        Ride ride = getRideById(rideId);

        // משנים את הסטטוס ל-CANCELLED
        ride.setStatus(Ride.RideStatus.CANCELLED);
        if (ride.getRideGroup() != null) {
            RideGroup group = ride.getRideGroup();
            group.setAvailableSeats(group.getAvailableSeats() + ride.getRequestedSeats());
            rideGroupRepository.save(group);
        }
        return rideRepository.save(ride);
    }
    //מעדכנת את סטטוס הנסיעה
    @Transactional
    public Ride updateRideStatus(Long rideId, Ride.RideStatus status) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() ->
                        new RuntimeException("Ride not found"));
        ride.setStatus(status);
        if (status == Ride.RideStatus.COMPLETED) {
            RideGroup group = ride.getRideGroup();
            if (group != null) {
                if (!ride.isShared()) {
                    Driver driver = group.getDriver();
                    group.setAvailableSeats(
                            driver.getMaxSeats() - 1
                    );
                } else {
                    group.setAvailableSeats(
                            group.getAvailableSeats()
                                    + ride.getRequestedSeats()
                    );
                }
                boolean hasActiveRides =
                        group.getRides().stream()
                                .filter(r -> !r.getId().equals(ride.getId()))
                                .anyMatch(r ->
                                        r.getStatus() == Ride.RideStatus.PENDING
                                                || r.getStatus() == Ride.RideStatus.ACTIVE
                                );
                if (!hasActiveRides) {
                    group.setStatus(RideGroup.RideGroupStatus.PENDING);
                }
                rideGroupRepository.save(group);
            }
        }
        return rideRepository.save(ride);
    }

    @Transactional
    public Ride completeRide(Long rideId) {

        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        if (ride.getStatus() == Ride.RideStatus.COMPLETED) {
            throw new RuntimeException("Ride already completed");
        }

        RideGroup group = ride.getRideGroup();

        ride.setStatus(Ride.RideStatus.COMPLETED);

        // אם זה נסיעה בקבוצה
        if (group != null) {

            group.setAvailableSeats(group.getAvailableSeats() + ride.getRequestedSeats());

            // אם אין יותר נסיעות פעילות → לסגור קבוצה
            boolean anyActiveRides = group.getRides().stream()
                    .anyMatch(r -> r.getStatus() != Ride.RideStatus.COMPLETED);

            if (!anyActiveRides) {
                group.setStatus(RideGroup.RideGroupStatus.COMPLETED);
            }
        }

        return rideRepository.save(ride);
    }
}
