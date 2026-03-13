package com.financeapp.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class BudgetUpdateDto extends BudgetDto {
    private UpdateType type;
    private Integer month;
    private Integer year;

    public enum UpdateType {
        PERMANENT,
        TEMPORARY
    }
}
