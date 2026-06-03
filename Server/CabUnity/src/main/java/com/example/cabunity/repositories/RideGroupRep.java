package com.example.cabunity.repositories;

import com.example.cabunity.entities.RideGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface RideGroupRep extends JpaRepository<RideGroup, Long> {

    // שליפת קבוצות לפי הסטטוס שלהן (למשל: תביא את כל הקבוצות שכרגע PENDING)
    List<RideGroup> findByStatus(RideGroup.RideGroupStatus status);
}

