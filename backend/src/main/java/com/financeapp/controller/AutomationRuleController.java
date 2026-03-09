package com.financeapp.controller;

import com.financeapp.dto.AutomationRuleDto;
import com.financeapp.service.AutomationRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/automation-rules")
@RequiredArgsConstructor
public class AutomationRuleController extends BaseController {

    private final AutomationRuleService ruleService;

    @GetMapping
    public ResponseEntity<List<AutomationRuleDto>> getAllRules(Authentication authentication) {
        return ResponseEntity.ok(ruleService.getAllRules(getCurrentUser(authentication)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutomationRuleDto> getRuleById(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(ruleService.getRuleById(getCurrentUser(authentication), id));
    }

    @PostMapping
    public ResponseEntity<AutomationRuleDto> createRule(
            Authentication authentication,
            @Valid @RequestBody AutomationRuleDto ruleDto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ruleService.createRule(getCurrentUser(authentication), ruleDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AutomationRuleDto> updateRule(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AutomationRuleDto ruleDto) {
        return ResponseEntity.ok(ruleService.updateRule(getCurrentUser(authentication), id, ruleDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(
            Authentication authentication,
            @PathVariable Long id) {
        ruleService.deleteRule(getCurrentUser(authentication), id);
        return ResponseEntity.noContent().build();
    }
}
