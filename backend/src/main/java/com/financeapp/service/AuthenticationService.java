package com.financeapp.service;

import com.financeapp.dto.AuthResponse;
import com.financeapp.dto.LoginRequest;
import com.financeapp.dto.RegisterRequest;
import com.financeapp.mapper.UserMapper;
import com.financeapp.model.Role;
import com.financeapp.model.User;
import com.financeapp.repository.UserRepository;
import com.financeapp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserMapper userMapper;
    private final CategoryService categoryService;

    public AuthResponse register(RegisterRequest request) {
        if (repository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username già in uso");
        }
        if (repository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email già registrata");
        }

        var user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        var savedUser = repository.save(user);

        // Seed default categories for the new user
        categoryService.seedDefaultCategories(savedUser);

        var jwtToken = jwtService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(userMapper.toDto(savedUser))
                .build();
    }

    public AuthResponse authenticate(LoginRequest request) {
        var userOptional = repository.findByUsername(request.getUsername());

        // 1. Proactive Lock Check
        if (userOptional.isPresent()) {
            var user = userOptional.get();
            if (user.getAccountLockedUntil() != null) {
                if (user.getAccountLockedUntil().isBefore(java.time.LocalDateTime.now())) {
                    // Lock expired, reset it
                    user.setAccountLockedUntil(null);
                    user.setFailedLoginAttempts(0);
                    repository.save(user);
                } else {
                    // Account is STILL LOCKED
                    throw new org.springframework.security.authentication.LockedException(
                            "Troppi tentativi falliti. Riprova tra 15 minuti.");
                }
            }
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            if (userOptional.isPresent()) {
                var user = userOptional.get();
                // Since we handled existing lock above, we just increment attempts here
                int currentAttempts = (user.getFailedLoginAttempts() == null) ? 0 : user.getFailedLoginAttempts();
                int newAttempts = currentAttempts + 1;
                user.setFailedLoginAttempts(newAttempts);

                if (newAttempts >= 5) {
                    user.setAccountLockedUntil(java.time.LocalDateTime.now().plusMinutes(15));
                    repository.save(user);
                    throw new org.springframework.security.authentication.LockedException(
                            "Troppi tentativi falliti. L'account è stato bloccato per 15 minuti.");
                }
                repository.save(user);
            }
            throw ex;
        }

        var user = repository.findByUsername(request.getUsername()).orElseThrow();
        user.setFailedLoginAttempts(0);
        user.setAccountLockedUntil(null);
        repository.save(user);

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(userMapper.toDto(user))
                .build();
    }
}
