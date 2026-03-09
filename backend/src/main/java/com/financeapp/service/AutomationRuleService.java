package com.financeapp.service;

import com.financeapp.dto.AutomationRuleDto;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.mapper.AutomationRuleMapper;
import com.financeapp.model.AutomationRule;
import com.financeapp.model.Category;
import com.financeapp.model.TransactionType;
import com.financeapp.model.User;
import com.financeapp.repository.AutomationRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AutomationRuleService {

    private final AutomationRuleRepository ruleRepository;
    private final AutomationRuleMapper ruleMapper;
    private final CategoryService categoryService;

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

        AutomationRule rule = ruleMapper.toEntity(ruleDto);
        rule.setUser(user);
        rule.setCategory(category);

        AutomationRule savedRule = ruleRepository.save(rule);
        return ruleMapper.toDto(savedRule);
    }

    public AutomationRuleDto updateRule(User user, Long id, AutomationRuleDto ruleDto) {
        AutomationRule rule = getRuleAndVerifyOwner(id, user);
        Category category = categoryService.getCategoryAndVerifyOwner(ruleDto.getCategoryId(), user);

        rule.setName(ruleDto.getName());
        rule.setType(ruleDto.getType());
        rule.setCategory(category);
        rule.setExecutionDay(ruleDto.getExecutionDay());
        rule.setPercentageOfIncome(ruleDto.getPercentageOfIncome());
        rule.setFixedAmount(ruleDto.getFixedAmount());

        AutomationRule updatedRule = ruleRepository.save(rule);
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
}
