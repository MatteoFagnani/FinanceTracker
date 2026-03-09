package com.financeapp.service.pattern.state;

import com.financeapp.dto.BudgetStatusDto;

public class BudgetContext {
    private BudgetState state;

    public BudgetContext() {
        this.state = new OkState();
    }

    public void setState(BudgetState state) {
        this.state = state;
    }

    public void applyState(BudgetStatusDto budgetStatusDto) {
        double percentage = budgetStatusDto.getPercentageUsed();

        if (percentage >= 100) {
            setState(new ExceededState());
        } else if (percentage >= 80) {
            setState(new WarningState());
        } else {
            setState(new OkState());
        }

        state.handle(budgetStatusDto);
    }
}
