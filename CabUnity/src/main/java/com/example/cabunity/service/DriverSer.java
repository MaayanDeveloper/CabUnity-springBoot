package com.example.cabunity.service;

import com.example.cabunity.entities.Driver;
import com.example.cabunity.entities.User;
import com.example.cabunity.repositories.DriverRep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // יוצר קונסטרקטור עבור ה-Repository באופן אוטומטי (הזרקת תלות)
public class DriverSer {

    private final UserSer userSer;
    private final DriverRep driverRepository;

    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }


    public Driver getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found with id: " + id));
    }


    @Transactional
    public Driver registerDriver(Driver driver, Long userId) {
        User existUser = userSer.getUserById(userId);
        driver.setUser(existUser);
        driver.setApprovalStatus(Driver.ApprovalStatus.PENDING);
        driver.setAvailable(false);
        return driverRepository.save(driver);
    }

    @Transactional
        public Driver approveDriver(Long driverId, boolean isApproved) {
        Driver driver = getDriverById(driverId);

        if (isApproved) {
            driver.setApprovalStatus(Driver.ApprovalStatus.APPROVED);
            User user = driver.getUser();
            user.setRole(User.Role.DRIVER);
        } else {
            driver.setApprovalStatus(Driver.ApprovalStatus.REJECTED);
        }
        return driverRepository.save(driver);
    }

    //  שינוי סטטוס זמינות
    @Transactional
    public void Availability(Long driverId, boolean isAvailable) {
        Driver driver = getDriverById(driverId);
        if (driver.getApprovalStatus() != Driver.ApprovalStatus.APPROVED) {
            throw new RuntimeException("Cannot change availability. Driver is not approved by admin.");
        }
        driver.setAvailable(isAvailable);
        driverRepository.save(driver);
    }

    @Transactional
    public void updateDriverLocation(Long driverId, double lat, double lng) {
        Driver driver = getDriverById(driverId);
        driver.setCurrentLat(lat);
        driver.setCurrentLng(lng);
        driverRepository.save(driver);
        // כאן בהמשך (כשחיה תסיים את הלוגים) תוכלי להוסיף שורה ששומרת את המיקום הזה
        // גם בתוך ה-LocationLogSer שלה כדי לשמור היסטוריה של איפה הנהג נסע.
    }
    // שליפת כל הנהגים שמחכים לאישור המנהל
    public List<Driver> getPendingDrivers() {
        return driverRepository.findByApprovalStatus(Driver.ApprovalStatus.PENDING);
    }
}