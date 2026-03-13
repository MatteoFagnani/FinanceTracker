package com.financeapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BudgetOverrideDto {
    private Long id;
    private Long budgetId;
    private Double amount;
    private Integer month;
    private Integer year;
    private LocalDateTime createdAt;
}
