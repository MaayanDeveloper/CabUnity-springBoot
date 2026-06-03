package com.example.cabunity.repositories;

import com.example.cabunity.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRep extends JpaRepository<User, Long> {

    // חיפוש לפי שם משתמש מדויק
    Optional<User> findByUsername(String username);

    // בדיקה אם אימייל קיים (לצורך הרשמה)
    boolean existsByEmail(String email);

    // חיפוש כל המשתמשים לפי תפקיד (למשל: תביא לי את כל ה-ADMIN)
    List<User> findByRole(User.Role role);

    // חיפוש חופשי: מוצא משתמשים שהשם שלהם מכיל את הטקסט (לא חייב להיות מדויק)
    List<User> findByUsernameContainingIgnoreCase(String username);

    // שאילתה מותאמת אישית: מוצאת משתמשים עם דירוג גבוה מציון מסוים
    @Query("SELECT u FROM User u WHERE u.rating >= :minRating")
    List<User> findHighRatedUsers(@Param("minRating") double minRating);
}