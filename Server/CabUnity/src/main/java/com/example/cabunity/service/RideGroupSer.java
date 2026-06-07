package com.example.cabunity.service;

import com.example.cabunity.dto.CreateRideRequest;
import com.example.cabunity.entities.Driver;
import com.example.cabunity.entities.Ride;
import com.example.cabunity.entities.RideGroup;
import com.example.cabunity.repositories.RideGroupRep;
import com.example.cabunity.repositories.RideRep;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.List;

import java.time.LocalDateTime;
import java.util.List;
@Service
@RequiredArgsConstructor
public class RideGroupSer {
    private final RideGroupRep rideGroupRepository;
    private final DriverSer driverSer;
    private final RideRep rideRepository;

    // הגדרת הדפדפן הוירטואלי של השרת
    private final RestClient restClient = RestClient.create();
    private final double MaxOriginMinutes = 999;
    private final double MaxDestMinute = 999;

    //מקבלת שני מיקומים- הנהג והמזמין- ומוצאת מה המרחק בינהם
    public double getDriveMinutes(
            double originLng,
            double originLat,
            double destLng,
            double destLat
    ) {
        try {
            String url = String.format(
                    "http://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false",
                    originLng, originLat, destLng, destLat
            );

            String response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            var parser = org.springframework.boot.json.JsonParserFactory.getJsonParser();
            java.util.Map<String, Object> jsonMap = parser.parseMap(response);

            java.util.List<?> routes = (java.util.List<?>) jsonMap.get("routes");
            java.util.Map<?, ?> firstRoute = (java.util.Map<?, ?>) routes.get(0);

            double durationInSeconds =
                    Double.parseDouble(firstRoute.get("duration").toString());

            return durationInSeconds / 60.0;

        } catch (Exception e) {
            System.out.println("OSRM Error: " + e.getMessage());
            return 999.0;
        }
    }
    //לפתוח נסיעה חדשה לפי נהג- להתחיל משמרת
    @Transactional
    public RideGroup createRideGroup(Long driverId) {
        Driver driver = driverSer.getDriverById(driverId);
        // הנהג חייב להיות מאושר
        if (driver.getApprovalStatus() != Driver.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Driver is not approved");
        }
        // אסור לפתוח משמרת נוספת אם כבר קיימת משמרת פעילה
        List<RideGroup> existingGroups =
                rideGroupRepository.findByDriverIdAndStatusIn(
                        driverId,
                        List.of(
                                RideGroup.RideGroupStatus.PENDING,
                                RideGroup.RideGroupStatus.ACTIVE
                        )
                );
        if (!existingGroups.isEmpty()) {
            throw new RuntimeException("Driver already has an active shift");
        }
        RideGroup group = new RideGroup();
        group.setDriver(driver);
        group.setStartTime(LocalDateTime.now());
        group.setStatus(RideGroup.RideGroupStatus.PENDING);
        int seatsForPassengers = driver.getMaxSeats() - 1;
        group.setAvailableSeats(seatsForPassengers);
        driver.setAvailable(true);
        return rideGroupRepository.save(group);
    }
    //מעדכנת את סטטוס המשמרת/קבוצה
    @Transactional
    public RideGroup updateGroupStatus(
            Long groupId,
            RideGroup.RideGroupStatus status) {
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() ->
                        new RuntimeException("RideGroup not found"));
        group.setStatus(status);
        return rideGroupRepository.save(group);
    }

    // מביאה את כל המוניות שיש בהן לפחות מקום אחד פנוי
    public List<RideGroup> getAvailableGroupsForAlgorithm() {
        List<RideGroup> allGroups = rideGroupRepository.findAll();
        System.out.println("ALL GROUPS FROM DB: " + allGroups.size());
        List<RideGroup> filtered = allGroups.stream()

                .peek(g -> System.out.println(
                        "CHECK GROUP ID=" + g.getId() +
                                " STATUS=" + g.getStatus() +
                                " SEATS=" + g.getAvailableSeats() +
                                " DRIVER_AVAILABLE=" + (g.getDriver() != null ? g.getDriver().getAvailable() : "NULL")
                ))
                .filter(g ->
                        g.getStatus() == RideGroup.RideGroupStatus.PENDING
                                || g.getStatus() == RideGroup.RideGroupStatus.ACTIVE
                )
                .filter(g -> g.getAvailableSeats() > 0)
                .filter(g -> g.getDriver() != null
                        && Boolean.TRUE.equals(g.getDriver().getAvailable()))
                .toList();
        System.out.println("AFTER FILTER GROUPS: " + filtered.size());
        return filtered;
    }

    @Transactional
    public RideGroup  matchRideToBestGroup(Long rideId) {

        System.out.println("===== MATCH START =====");

        Ride newRide = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        int seatsNeeded = newRide.getRequestedSeats();

        List<RideGroup> availableGroups = getAvailableGroupsForAlgorithm();

        RideGroup bestGroup = null;
        double minEtaMinutes = Double.MAX_VALUE;

        for (RideGroup group : availableGroups) {

            List<Ride> rides =
                    (group.getRides() == null) ? List.of() : group.getRides();

            // ❌ לא מספיק מושבים
            if (group.getAvailableSeats() < seatsNeeded) continue;

            // ❌ נסיעה פרטית לא יכולה להצטרף לקבוצה קיימת
            if (!newRide.isShared() && !rides.isEmpty()) continue;

            // ❌ כבר יש פרטית בקבוצה
            if (!rides.isEmpty() && !rides.get(0).isShared()) continue;

            // ❌ בדיקת יעד מול נוסע ראשון
            if (!rides.isEmpty()) {

                Ride firstPassenger = rides.get(0);

                double destDiff = getDriveMinutes(
                        firstPassenger.getDestLng(),
                        firstPassenger.getDestLat(),
                        newRide.getDestLng(),
                        newRide.getDestLat()
                );

                if (destDiff > MaxDestMinute) continue;
            }

            // 🎯 ETA מהנהג לנקודת איסוף
            double currentEta = getDriveMinutes(
                    group.getDriver().getCurrentLng(),
                    group.getDriver().getCurrentLat(),
                    newRide.getOriginLng(),
                    newRide.getOriginLat()
            );

            if (currentEta < minEtaMinutes) {
                minEtaMinutes = currentEta;
                bestGroup = group;
            }
        }

        // ===== RESULT =====

        if (bestGroup == null) {
            throw new RuntimeException("No available drivers with enough seats for your request.");
        }

        newRide.setRideGroup(bestGroup);
        bestGroup.setStatus(RideGroup.RideGroupStatus.ACTIVE);

        rideRepository.save(newRide);

        if (!newRide.isShared()) {
            bestGroup.setAvailableSeats(0);
        } else {
            bestGroup.setAvailableSeats(
                    bestGroup.getAvailableSeats() - seatsNeeded
            );
        }

        rideGroupRepository.save(bestGroup);

        System.out.println("MATCH SUCCESS DONE");
        return bestGroup;
    }
    @Transactional
    public RideGroup endShift(Long groupId) {
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("RideGroup not found"));
        Driver driver = group.getDriver();
        driver.setAvailable(false);
        group.setEndTime(LocalDateTime.now());
        group.setStatus(RideGroup.RideGroupStatus.COMPLETED);
        return rideGroupRepository.save(group);
    }


    }
