package com.financeapp.repository;

import com.financeapp.model.AutomationRule;
import com.financeapp.model.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AutomationRuleRepository extends JpaRepository<AutomationRule, Long> {
    List<AutomationRule> findByUserId(Long userId);

    List<AutomationRule> findByUserIdAndType(Long userId, TransactionType type);

    List<AutomationRule> findByExecutionDay(Integer executionDay);
}
