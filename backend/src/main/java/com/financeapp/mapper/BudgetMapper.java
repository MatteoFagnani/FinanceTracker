package com.financeapp.mapper;

import com.financeapp.dto.BudgetDto;
import com.financeapp.model.Budget;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BudgetMapper {
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "category.color", target = "categoryColor")
    BudgetDto toDto(Budget budget);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "user", ignore = true)
    Budget toEntity(BudgetDto dto);
}
