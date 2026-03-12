package com.financeapp.service;

import com.financeapp.model.AutomationRule;
import com.financeapp.repository.AutomationRuleRepository;
import com.financeapp.service.AutomationRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AutomationTask {

    private final AutomationRuleRepository ruleRepository;
    private final AutomationRuleService automationRuleService;

    // Run every day at 1:00 AM
    @Scheduled(cron = "0 0 1 * * *")
    public void executeAutomationRules() {
        int today = LocalDate.now().getDayOfMonth();
        List<AutomationRule> rulesForToday = ruleRepository.findAll().stream()
                .filter(rule -> rule.getExecutionDay() != null && rule.getExecutionDay() == today)
                .collect(Collectors.toList());

        rulesForToday.forEach(automationRuleService::executeRule);
    }
}
