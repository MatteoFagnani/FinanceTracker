package com.financeapp.dto;

import com.financeapp.model.TransactionType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AutomationRuleDto {
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Type is required")
    private TransactionType type;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String categoryName;

    @Min(value = 1, message = "Execution day must be between 1 and 31")
    @Max(value = 31, message = "Execution day must be between 1 and 31")
    private Integer executionDay;

    @Min(value = 0, message = "Percentage must be positive")
    @Max(value = 100, message = "Percentage cannot exceed 100")
    private Double percentageOfIncome;

    @Min(value = 0, message = "Fixed amount must be positive")
    private Double fixedAmount;
}
