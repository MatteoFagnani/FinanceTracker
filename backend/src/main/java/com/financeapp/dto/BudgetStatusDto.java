package com.financeapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetStatusDto {
    private BudgetDto budget;
    private Double currentSpending;
    private Double remainingAmount;
    private Double percentageUsed;
    private String status;
}
