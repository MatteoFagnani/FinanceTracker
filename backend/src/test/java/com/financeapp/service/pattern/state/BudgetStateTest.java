package com.financeapp.service.pattern.state;

import com.financeapp.dto.BudgetStatusDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class BudgetStateTest {

    private BudgetContext budgetContext;

    @BeforeEach
    void setUp() {
        budgetContext = new BudgetContext();
    }

    @Test
    void applyState_WhenPercentageIsLow_ShouldBeOkState() {
        BudgetStatusDto status = new BudgetStatusDto();
        status.setPercentageUsed(50.0);

        budgetContext.applyState(status);

        assertEquals("OK", status.getStatus());
    }

    @Test
    void applyState_WhenPercentageIsMedium_ShouldBeWarningState() {
        BudgetStatusDto status = new BudgetStatusDto();
        status.setPercentageUsed(85.0);

        budgetContext.applyState(status);

        assertEquals("WARNING", status.getStatus());
    }

    @Test
    void applyState_WhenPercentageIsExceeding_ShouldBeExceededState() {
        BudgetStatusDto status = new BudgetStatusDto();
        status.setPercentageUsed(110.0);

        budgetContext.applyState(status);

        assertEquals("EXCEEDED", status.getStatus());
    }
}
