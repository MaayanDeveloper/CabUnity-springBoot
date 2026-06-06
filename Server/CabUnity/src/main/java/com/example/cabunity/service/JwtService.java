package com.example.cabunity.service;

import com.example.cabunity.entities.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    // מפתח הצפנה סודי (חייב להיות ארוך ומאובטח)
    private static final String SECRET_KEY = "SECRET_KEY_FOR_CABUNITY_SHOULD_BE_VERY_LONG_AND_SECURE_1234567890";
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    
    // תוקף הטוקן: 24 שעות (במילישניות)
    private static final long EXPIRATION_TIME = 86400000;

    // פונקציה שמייצרת טוקן מוצפן לפי פרטי המשתמש
    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("role", user.getRole().name());
        claims.put("name", user.getName());

        return Jwts.builder()
                .setClaims(claims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // פונקציה לפענוח וחילוץ המידע מהטוקן
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Long extractUserId(String token) {
        return extractAllClaims(token).get("userId", Long.class);
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
}