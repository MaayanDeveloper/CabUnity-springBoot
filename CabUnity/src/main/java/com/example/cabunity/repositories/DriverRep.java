package com.example.cabunity.repositories;

import com.example.cabunity.entities.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRep  extends JpaRepository<Driver, Long> {
    boolean existsBycarModel(String carModel);

}
