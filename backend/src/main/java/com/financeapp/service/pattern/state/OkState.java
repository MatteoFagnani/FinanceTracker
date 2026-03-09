package com.financeapp.service.pattern.state;

import com.financeapp.dto.BudgetStatusDto;
import org.springframework.stereotype.Component;

@Component
public class OkState implements BudgetState {

    @Override
    public void handle(BudgetStatusDto budgetStatus) {
        budgetStatus.setStatus("OK");
        // State transitioning logic handled by context
    }
}
