package com.financeapp.mapper;

import com.financeapp.dto.AutomationRuleDto;
import com.financeapp.model.AutomationRule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AutomationRuleMapper {
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    AutomationRuleDto toDto(AutomationRule rule);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "user", ignore = true)
    AutomationRule toEntity(AutomationRuleDto dto);
}
