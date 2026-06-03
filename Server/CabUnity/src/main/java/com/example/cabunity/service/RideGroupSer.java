package com.example.cabunity.service;

import com.example.cabunity.entities.Driver;
import com.example.cabunity.entities.Ride;
import com.example.cabunity.entities.RideGroup;
import com.example.cabunity.repositories.RideGroupRep;
import com.example.cabunity.repositories.RideRep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final double MaxOriginMinutes = 15.0;
    private final double MaxDestMinute = 15.0;

    //מקבלת שני מיקומים- הנהג והמזמין- ומוצאת מה המרחק בינהם
    public double getDriveMinutes( double lon1D ,double lat1D,  double lon2U ,double lat2U) {
        try {
            String url = String.format(
                    "http://router.project-osrm.org/route/v1/driving/%f,%f;%f,%f?overview=false",
                    lon1D, lat1D, lon2U, lat2U
            );

            String response = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(String.class);

            var parser = org.springframework.boot.json.JsonParserFactory.getJsonParser();
            java.util.Map<String, Object> jsonMap = parser.parseMap(response);

            java.util.List<?> routes = (java.util.List<?>) jsonMap.get("routes");
            java.util.Map<?, ?> firstRoute = (java.util.Map<?, ?>) routes.get(0);
            double durationInSeconds = Double.parseDouble(firstRoute.get("duration").toString());

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

        RideGroup group = new RideGroup();
        group.setDriver(driver);
        group.setStartTime(LocalDateTime.now());
        group.setStatus(RideGroup.RideGroupStatus.PENDING);

        int seatsForPassengers = driver.getMaxSeats() - 1;
        group.setAvailableSeats(seatsForPassengers);

        return rideGroupRepository.save(group);
    }

    //מעדכנת את סטטוס הנסיעה
    @Transactional
    public RideGroup updateGroupStatus(Long groupId, RideGroup.RideGroupStatus newStatus) {
        RideGroup group = rideGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("RideGroup not found"));
        group.setStatus(newStatus);
        return rideGroupRepository.save(group);
    }

    //מביאה את כל המוניות שיש בהן לפחות מקום אחד פנוי
    public List<RideGroup> getAvailableGroupsForAlgorithm() {
        return rideGroupRepository.findAll().stream()
                .filter(g -> (g.getStatus() == RideGroup.RideGroupStatus.PENDING || g.getStatus() == RideGroup.RideGroupStatus.ACTIVE))
                .filter(g -> g.getAvailableSeats() > 0)
                .toList();
    }

    @Transactional
    public void matchRideToBestGroup(Long rideId) {
        Ride newRide = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        int seatsNeeded = newRide.getRequestedSeats();
        List<RideGroup> availableGroups = getAvailableGroupsForAlgorithm();
        RideGroup bestGroup = null;
        double minEtaMinutes = Double.MAX_VALUE;
        for (RideGroup group : availableGroups) {
            if (group.getAvailableSeats() < seatsNeeded) {
                continue;
            }
            if (!newRide.isShared() && !group.getRides().isEmpty()) continue;
            if (!group.getRides().isEmpty() && !group.getRides().get(0).isShared()) continue;
            if (!group.getRides().isEmpty()) {
                Ride firstPassenger = group.getRides().get(0);
                double destDiff = getDriveMinutes(
                        firstPassenger.getDestLat(), firstPassenger.getDestLng(),
                        newRide.getDestLat(), newRide.getDestLng()
                );
                if (destDiff > MaxDestMinute) continue;
            }
            double currentEta = getDriveMinutes(
                    group.getDriver().getCurrentLat(), group.getDriver().getCurrentLng(),
                    newRide.getOriginLat(), newRide.getOriginLng()
            );
            if (currentEta < minEtaMinutes) {
                minEtaMinutes = currentEta;
                bestGroup = group;
            }
        }
        if (bestGroup != null) {
            newRide.setRideGroup(bestGroup);
            rideRepository.save(newRide);
            if (!newRide.isShared()) {
                bestGroup.setAvailableSeats(0);
            } else {
                int remainingSeats = bestGroup.getAvailableSeats() - seatsNeeded;
                bestGroup.setAvailableSeats(remainingSeats);
            }
            rideGroupRepository.save(bestGroup);
            System.out.println("Matched successfully! Remaining seats in taxi: " + bestGroup.getAvailableSeats());
        } else {
            throw new RuntimeException("No available drivers with enough seats for your request.");
        }
    }
    }
