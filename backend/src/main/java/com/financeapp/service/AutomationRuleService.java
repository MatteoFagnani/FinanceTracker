package com.financeapp.service;

import com.financeapp.dto.AutomationRuleDto;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.mapper.AutomationRuleMapper;
import com.financeapp.model.AutomationRule;
import com.financeapp.model.Category;
import com.financeapp.model.Transaction;
import com.financeapp.model.TransactionType;
import com.financeapp.model.User;
import com.financeapp.repository.AutomationRuleRepository;
import com.financeapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AutomationRuleService {

    private final AutomationRuleRepository ruleRepository;
    private final AutomationRuleMapper ruleMapper;
    private final CategoryService categoryService;
    private final TransactionRepository transactionRepository;

    public List<AutomationRuleDto> getAllRules(User user) {
        return ruleRepository.findByUserId(user.getId())
                .stream()
                .map(ruleMapper::toDto)
                .collect(Collectors.toList());
    }

    public AutomationRuleDto getRuleById(User user, Long id) {
        AutomationRule rule = getRuleAndVerifyOwner(id, user);
        return ruleMapper.toDto(rule);
    }

    public AutomationRuleDto createRule(User user, AutomationRuleDto ruleDto) {
        Category category = categoryService.getCategoryAndVerifyOwner(ruleDto.getCategoryId(), user);

        validateAmounts(ruleDto);
        calculateMonthlyAmountIfNecessary(ruleDto);

        AutomationRule rule = ruleMapper.toEntity(ruleDto);
        rule.setUser(user);
        rule.setCategory(category);

        AutomationRule savedRule = ruleRepository.save(rule);
        
        // Execute rule immediately if the day is less than or equal to today
        if (rule.getExecutionDay() != null && rule.getExecutionDay() <= LocalDate.now().getDayOfMonth()) {
            executeRule(savedRule);
        }
        
        return ruleMapper.toDto(savedRule);
    }

    public void executeRule(AutomationRule rule) {
        double amount = 0;
        if (rule.getMonthlyAmount() != null) {
            amount = rule.getMonthlyAmount();
        }

        if (amount > 0) {
            LocalDate now = LocalDate.now();
            LocalDate startOfMonth = now.withDayOfMonth(1);
            LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

            Transaction transaction = transactionRepository
                    .findFirstByAutomationRuleAndDateBetween(rule, startOfMonth, endOfMonth)
                    .orElse(new Transaction());

            transaction.setAmount(amount);
            transaction.setType(rule.getType());
            if (transaction.getId() == null) {
                transaction.setDate(now);
                transaction.setAutomatic(true);
                transaction.setAutomationRule(rule);
                transaction.setUser(rule.getUser());
            }
            transaction.setDescription("Automated: " + rule.getName());
            transaction.setCategory(rule.getCategory());
            
            transactionRepository.save(transaction);
        }
    }

    public AutomationRuleDto updateRule(User user, Long id, AutomationRuleDto ruleDto) {
        AutomationRule rule = getRuleAndVerifyOwner(id, user);
        Category category = categoryService.getCategoryAndVerifyOwner(ruleDto.getCategoryId(), user);

        validateAmounts(ruleDto);
        calculateMonthlyAmountIfNecessary(ruleDto);

        rule.setName(ruleDto.getName());
        rule.setType(ruleDto.getType());
        rule.setCategory(category);
        rule.setExecutionDay(ruleDto.getExecutionDay());
        rule.setMonthlyAmount(ruleDto.getMonthlyAmount());
        rule.setAnnualAmount(ruleDto.getAnnualAmount());

        AutomationRule updatedRule = ruleRepository.save(rule);
        
        // Execute rule immediately if the day is less than or equal to today
        if (updatedRule.getExecutionDay() != null && updatedRule.getExecutionDay() <= LocalDate.now().getDayOfMonth()) {
            executeRule(updatedRule);
        }
        
        return ruleMapper.toDto(updatedRule);
    }

    public void deleteRule(User user, Long id) {
        AutomationRule rule = getRuleAndVerifyOwner(id, user);
        ruleRepository.delete(rule);
    }

    private AutomationRule getRuleAndVerifyOwner(Long id, User user) {
        AutomationRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Automation Rule not found with id: " + id));

        if (!rule.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to access this rule");
        }

        return rule;
    }

    private void validateAmounts(AutomationRuleDto ruleDto) {
        if (ruleDto.getMonthlyAmount() != null && ruleDto.getAnnualAmount() != null) {
            throw new IllegalArgumentException("Only one between monthlyAmount and annualAmount can be set.");
        }
        if (ruleDto.getMonthlyAmount() == null && ruleDto.getAnnualAmount() == null) {
            throw new IllegalArgumentException("Either monthlyAmount or annualAmount must be provided.");
        }
    }

    private void calculateMonthlyAmountIfNecessary(AutomationRuleDto ruleDto) {
        if (ruleDto.getAnnualAmount() != null) {
            ruleDto.setMonthlyAmount(ruleDto.getAnnualAmount() / 12.0);
        }
    }
}
