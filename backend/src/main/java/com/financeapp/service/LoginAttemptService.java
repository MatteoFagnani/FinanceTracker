package com.financeapp.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

@Service
public class LoginAttemptService {

    private static final Duration WINDOW = Duration.ofMinutes(15);
    private static final int MAX_IP_ATTEMPTS = 20;
    private static final int MAX_USERNAME_ATTEMPTS = 10;
    private static final int MAX_IP_USERNAME_ATTEMPTS = 5;
    private static final String UNKNOWN_IP = "unknown";

    private final ConcurrentMap<String, AttemptWindow> ipAttempts = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, AttemptWindow> usernameAttempts = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, AttemptWindow> ipUsernameAttempts = new ConcurrentHashMap<>();

    public boolean isBlocked(String clientIp, String username) {
        Instant now = Instant.now();
        String normalizedIp = normalizeIp(clientIp);
        String normalizedUsername = normalizeUsername(username);

        return isBlocked(ipAttempts, normalizedIp, MAX_IP_ATTEMPTS, now)
                || isBlocked(usernameAttempts, normalizedUsername, MAX_USERNAME_ATTEMPTS, now)
                || isBlocked(ipUsernameAttempts, compositeKey(normalizedIp, normalizedUsername), MAX_IP_USERNAME_ATTEMPTS, now);
    }

    public void recordFailure(String clientIp, String username) {
        Instant now = Instant.now();
        String normalizedIp = normalizeIp(clientIp);
        String normalizedUsername = normalizeUsername(username);

        recordFailure(ipAttempts, normalizedIp, now);
        recordFailure(usernameAttempts, normalizedUsername, now);
        recordFailure(ipUsernameAttempts, compositeKey(normalizedIp, normalizedUsername), now);
    }

    public void recordSuccess(String clientIp, String username) {
        String normalizedIp = normalizeIp(clientIp);
        String normalizedUsername = normalizeUsername(username);

        usernameAttempts.remove(normalizedUsername);
        ipUsernameAttempts.remove(compositeKey(normalizedIp, normalizedUsername));
    }

    void clear() {
        ipAttempts.clear();
        usernameAttempts.clear();
        ipUsernameAttempts.clear();
    }

    private boolean isBlocked(ConcurrentMap<String, AttemptWindow> attempts, String key, int maxAttempts, Instant now) {
        AttemptWindow window = attempts.get(key);
        if (window == null) {
            return false;
        }
        if (window.isExpired(now)) {
            attempts.remove(key, window);
            return false;
        }
        return window.count() >= maxAttempts;
    }

    private void recordFailure(ConcurrentMap<String, AttemptWindow> attempts, String key, Instant now) {
        attempts.compute(key, (ignored, window) -> {
            if (window == null || window.isExpired(now)) {
                return new AttemptWindow(1, now.plus(WINDOW));
            }
            return new AttemptWindow(window.count() + 1, window.expiresAt());
        });
    }

    private String normalizeIp(String clientIp) {
        return Objects.requireNonNullElse(clientIp, UNKNOWN_IP).trim();
    }

    private String normalizeUsername(String username) {
        return Objects.requireNonNullElse(username, "").trim().toLowerCase();
    }

    private String compositeKey(String clientIp, String username) {
        return clientIp + "|" + username;
    }

    private record AttemptWindow(int count, Instant expiresAt) {
        private boolean isExpired(Instant now) {
            return !expiresAt.isAfter(now);
        }
    }
}
