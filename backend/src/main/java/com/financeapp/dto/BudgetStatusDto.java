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
    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;
    private Integer month;
    private Integer year;
    private Double limitAmount;
    private Double percentageOfIncome;
    private boolean automatic;
    
    private Double currentSpending;
    private Double remainingAmount;
    private Double percentageUsed;
    private boolean overridden;
    private String status;
}
