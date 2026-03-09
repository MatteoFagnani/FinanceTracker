package com.financeapp.service.pattern.state;

import com.financeapp.dto.BudgetStatusDto;
import org.springframework.stereotype.Component;

@Component
public class WarningState implements BudgetState {

    @Override
    public void handle(BudgetStatusDto budgetStatus) {
        budgetStatus.setStatus("WARNING");
    }
}
