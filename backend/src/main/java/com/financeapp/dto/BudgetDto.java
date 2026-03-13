package com.financeapp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BudgetDto {
    private Long id;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private String categoryName;
    private String categoryColor;


    // @NotNull(message = "Limit amount is required")
    @Min(value = 0, message = "Limit amount must be positive")
    private Double limitAmount;

    private Double percentageOfIncome;

    private boolean automatic;
}
