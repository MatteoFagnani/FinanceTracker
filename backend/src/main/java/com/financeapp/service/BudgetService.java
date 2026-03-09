package com.financeapp.service;

import com.financeapp.dto.BudgetDto;
import com.financeapp.exception.ResourceNotFoundException;
import com.financeapp.mapper.BudgetMapper;
import com.financeapp.model.Budget;
import com.financeapp.model.Category;
import com.financeapp.model.TransactionType;
import com.financeapp.model.User;
import com.financeapp.repository.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetMapper budgetMapper;
    private final CategoryService categoryService;

    public List<BudgetDto> getBudgetsByMonthAndYear(User user, Integer month, Integer year) {
        return budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year)
                .stream()
                .map(budgetMapper::toDto)
                .collect(Collectors.toList());
    }

    public BudgetDto getBudgetById(User user, Long id) {
        Budget budget = getBudgetAndVerifyOwner(id, user);
        return budgetMapper.toDto(budget);
    }

    public BudgetDto createBudget(User user, BudgetDto budgetDto) {
        Category category = categoryService.getCategoryAndVerifyOwner(budgetDto.getCategoryId(), user);

        if (category.getType() != TransactionType.EXPENSE) {
            throw new IllegalArgumentException("Budgets can only be set for EXPENSE categories");
        }

        if (budgetRepository.findByUserIdAndCategoryIdAndMonthAndYear(
                user.getId(), category.getId(), budgetDto.getMonth(), budgetDto.getYear()).isPresent()) {
            throw new IllegalArgumentException(
                    "A budget already exists for this category in the specified month and year");
        }

        Budget budget = budgetMapper.toEntity(budgetDto);
        budget.setUser(user);
        budget.setCategory(category);

        Budget savedBudget = budgetRepository.save(budget);
        return budgetMapper.toDto(savedBudget);
    }

    public BudgetDto updateBudget(User user, Long id, BudgetDto budgetDto) {
        Budget budget = getBudgetAndVerifyOwner(id, user);

        budget.setLimitAmount(budgetDto.getLimitAmount());
        budget.setAutomatic(budgetDto.isAutomatic());

        Budget updatedBudget = budgetRepository.save(budget);
        return budgetMapper.toDto(updatedBudget);
    }

    public void deleteBudget(User user, Long id) {
        Budget budget = getBudgetAndVerifyOwner(id, user);
        budgetRepository.delete(budget);
    }

    private Budget getBudgetAndVerifyOwner(Long id, User user) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));

        if (!budget.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to access this budget");
        }

        return budget;
    }
}
