package com.financeapp.controller;

import com.financeapp.dto.PasswordChangeRequest;
import com.financeapp.dto.ProfileUpdateRequest;
import com.financeapp.dto.UserDto;
import com.financeapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController extends BaseController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUserProfile(Authentication authentication) {
        // This is just a utility if needed, but the user is already in AuthResponse
        // However, it's good practice for a profile page refresh
        return ResponseEntity.ok(userService.updateProfile(getCurrentUser(authentication), new ProfileUpdateRequest()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(getCurrentUser(authentication), request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            Authentication authentication,
            @RequestBody PasswordChangeRequest request) {
        userService.changePassword(getCurrentUser(authentication), request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteAccount(Authentication authentication) {
        userService.deleteAccount(getCurrentUser(authentication));
        return ResponseEntity.ok().build();
    }
}
