package com.example.cabunity.service;

import com.example.cabunity.entities.Driver;
import com.example.cabunity.repositories.DriverRep;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // יוצר קונסטרקטור עבור ה-Repository באופן אוטומטי (הזרקת תלות)
public class DriverSer {

    private final DriverRep driverRepository;

    // - מחזיר את כל הנהגים
    public List<Driver> getAllDrivers() {
        return driverRepository.findAll();
    }

    // - מחזיר נהג לפי ה-ID שלו
    public Optional<Driver> getDriverById(Long id) {
        return driverRepository.findById(id);
    }
}