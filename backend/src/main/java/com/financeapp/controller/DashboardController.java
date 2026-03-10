package com.financeapp.controller;

import com.financeapp.dto.DashboardOverviewDto;
import com.financeapp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController extends BaseController {

    private final DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardOverviewDto> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getDashboardOverview(getCurrentUser(authentication)));
    }
}
