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
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));
        var user = repository.findByUsername(request.getUsername())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwtToken)
                .user(userMapper.toDto(user))
                .build();
    }
}
