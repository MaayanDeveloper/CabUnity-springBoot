package com.example.cabunity.dto;

import com.example.cabunity.entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class LoginResponse {
    private String token;
    private User user;
}