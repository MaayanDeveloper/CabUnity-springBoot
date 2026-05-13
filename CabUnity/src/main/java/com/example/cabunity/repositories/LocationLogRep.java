package com.example.cabunity.repositories;

import com.example.cabunity.entities.Driver;
import com.example.cabunity.entities.LocationLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationLogRep  extends JpaRepository<LocationLog, Long> {

}
