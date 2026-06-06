package com.example.cabunity.repositories;

import com.example.cabunity.entities.RideGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface RideGroupRep extends JpaRepository<RideGroup, Long> {

    List<RideGroup> findByStatus(RideGroup.RideGroupStatus status);
    List<RideGroup> findByDriverIdAndStatusIn(
            Long driverId,
            List<RideGroup.RideGroupStatus> statuses
    );
}

