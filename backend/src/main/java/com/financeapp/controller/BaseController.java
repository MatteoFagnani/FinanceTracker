package com.financeapp.controller;

import com.financeapp.model.User;
import org.springframework.security.core.Authentication;

public abstract class BaseController {
    protected User getCurrentUser(Authentication authentication) {
        return (User) authentication.getPrincipal();
    }
}
