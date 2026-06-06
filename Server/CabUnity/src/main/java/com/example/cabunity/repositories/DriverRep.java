package com.example.cabunity.repositories;

import com.example.cabunity.entities.Driver;
import com.example.cabunity.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface DriverRep  extends JpaRepository<Driver, Long> {
    boolean existsBycarModel(String carModel);
    List<Driver> findByApprovalStatus(Driver.ApprovalStatus status);
    Driver findByUser(User user);
}
