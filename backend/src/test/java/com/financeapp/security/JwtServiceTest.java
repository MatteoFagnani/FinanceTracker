package com.financeapp.security;

import com.financeapp.model.Role;
import com.financeapp.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Set fixed secret key via reflection (simulating @Value)
        ReflectionTestUtils.setField(jwtService, "secretKey",
                "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L); // 24 hours

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("password123")
                .role(Role.USER)
                .build();
    }

    @Test
    void generateToken_ShouldReturnValidToken() {
        String token = jwtService.generateToken(testUser);

        assertNotNull(token);
        assertFalse(token.isEmpty());

        String extractedUsername = jwtService.extractUsername(token);
        assertEquals(testUser.getUsername(), extractedUsername);
    }

    @Test
    void isTokenValid_WithCorrectUser_ShouldReturnTrue() {
        String token = jwtService.generateToken(testUser);

        assertTrue(jwtService.isTokenValid(token, testUser));
    }

    @Test
    void isTokenValid_WithIncorrectUser_ShouldReturnFalse() {
        String token = jwtService.generateToken(testUser);

        User otherUser = User.builder()
                .username("otheruser")
                .build();

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }
}
