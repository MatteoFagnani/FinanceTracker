package com.financeapp.service.pattern.strategy;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReportContext {

    private final MonthlyReportStrategy monthlyReportStrategy;
    private final CategoryReportStrategy categoryReportStrategy;

    public ReportStrategy getStrategy(String type) {
        if ("CATEGORY".equalsIgnoreCase(type)) {
            return categoryReportStrategy;
        }
        // Default to monthly timeline
        return monthlyReportStrategy;
    }
}
