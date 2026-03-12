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

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;
import com.financeapp.dto.BudgetStatusDto;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.service.pattern.state.BudgetContext;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final BudgetMapper budgetMapper;
    private final CategoryService categoryService;
    private final TransactionRepository transactionRepository;

    public List<BudgetStatusDto> getBudgetStatusesByMonthAndYear(User user, Integer month, Integer year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(user.getId(), month, year);
        
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = YearMonth.of(year, month).atEndOfMonth();
        
        BudgetContext budgetContext = new BudgetContext();
        
        double totalIncome = transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(
            user.getId(), startOfMonth, endOfMonth)
            .stream()
            .filter(t -> t.getType() == TransactionType.INCOME)
            .mapToDouble(com.financeapp.model.Transaction::getAmount)
            .sum();

        return budgets.stream().map(budget -> {
            Double effectiveLimit = budget.getLimitAmount();
            if (budget.getPercentageOfIncome() != null) {
                effectiveLimit = totalIncome * (budget.getPercentageOfIncome() / 100.0);
            }

            final Double limit = effectiveLimit; // effectiveLimit is effectively final for lambda
            
            double currentSpending = transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                user.getId(), startOfMonth, endOfMonth)
                .stream()
                .filter(t -> t.getCategory().getId().equals(budget.getCategory().getId()) && 
                            t.getType() == TransactionType.EXPENSE)
                .mapToDouble(com.financeapp.model.Transaction::getAmount)
                .sum();
                
            double percentageUsed = limit > 0 ? (currentSpending / limit) * 100 : 0;
            
            BudgetStatusDto statusDto = BudgetStatusDto.builder()
                .id(budget.getId())
                .categoryId(budget.getCategory().getId())
                .categoryName(budget.getCategory().getName())
                .categoryColor(budget.getCategory().getColor())
                .month(budget.getMonth())
                .year(budget.getYear())
                .limitAmount(limit)
                .percentageOfIncome(budget.getPercentageOfIncome())
                .automatic(budget.isAutomatic())
                .currentSpending(currentSpending)
                .remainingAmount(limit - currentSpending)
                .percentageUsed(percentageUsed)
                .build();
                
            budgetContext.applyState(statusDto);
            return statusDto;
        }).collect(Collectors.toList());
    }

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
        budget.setPercentageOfIncome(budgetDto.getPercentageOfIncome());
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
