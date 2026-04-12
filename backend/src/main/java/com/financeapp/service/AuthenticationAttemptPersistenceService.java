package com.financeapp.service;

import com.financeapp.model.User;
import com.financeapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationAttemptPersistenceService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long ACCOUNT_LOCK_MINUTES = 15;

    private final UserRepository repository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<User> getUserForAuthentication(String username) {
        Optional<User> userOptional = repository.findWithLockByUsername(username);

        userOptional.ifPresent(user -> {
            if (user.getAccountLockedUntil() != null
                    && user.getAccountLockedUntil().isBefore(LocalDateTime.now())) {
                user.setAccountLockedUntil(null);
                user.setFailedLoginAttempts(0);
                repository.save(user);
            }
        });

        return userOptional;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recordFailedAttempt(String username) {
        repository.findWithLockByUsername(username).ifPresent(user -> {
            int currentAttempts = user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts();
            int newAttempts = currentAttempts + 1;
            user.setFailedLoginAttempts(newAttempts);

            if (newAttempts >= MAX_FAILED_ATTEMPTS) {
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(ACCOUNT_LOCK_MINUTES));
            }

            repository.save(user);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<User> resetSuccessfulLogin(String username) {
        Optional<User> userOptional = repository.findWithLockByUsername(username);
        userOptional.ifPresent(user -> {
            user.setFailedLoginAttempts(0);
            user.setAccountLockedUntil(null);
            repository.save(user);
        });
        return userOptional;
    }
}
