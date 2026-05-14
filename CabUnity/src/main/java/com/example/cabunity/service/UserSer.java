package com.example.cabunity.service;

import com.example.cabunity.entities.User;
import com.example.cabunity.repositories.UserRep; // ייבוא שמתאים לשם החדש
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserSer {

    private final UserRep userRep; // שימוש בשם המדויק שהגדרת

    public List<User> getAllUsers() {
        return userRep.findAll();
    }

    public User getUserById(Long id) {
        return userRep.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRep.findByRole(role);
    }

    @Transactional
    public User createUser(User user) {
        if (userRep.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already taken!");
        }
        return userRep.save(user);
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        user.setUsername(userDetails.getUsername());
        user.setEmail(userDetails.getEmail());
        user.setRole(userDetails.getRole());
        user.setRating(userDetails.getRating());
        user.setProfileImage(userDetails.getProfileImage());
        return userRep.save(user);
    }

    @Transactional
    public void updateUserRating(Long id, double newRating) {
        User user = getUserById(id);
        user.setRating(newRating);
        userRep.save(user);
    }

    public void deleteUser(Long id) {
        if (!userRep.existsById(id)) {
            throw new RuntimeException("Cannot delete: User not found");
        }
        userRep.deleteById(id);
    }
}