package com.financeapp.service.pattern.state;

import com.financeapp.dto.BudgetStatusDto;

public interface BudgetState {
    void handle(BudgetStatusDto budgetStatus);
}
