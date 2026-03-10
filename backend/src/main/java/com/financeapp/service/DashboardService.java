package com.financeapp.service;

import com.financeapp.dto.BudgetStatusDto;
import com.financeapp.dto.DashboardOverviewDto;
import com.financeapp.dto.ReportDto;
import com.financeapp.dto.TransactionDto;
import com.financeapp.model.TransactionType;
import com.financeapp.model.User;
import com.financeapp.service.pattern.state.BudgetContext;
import com.financeapp.service.pattern.strategy.ReportContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionService transactionService;
    private final BudgetService budgetService;
    private final ReportContext reportContext;

    public DashboardOverviewDto getDashboardOverview(User user) {
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = YearMonth.from(now).atEndOfMonth();

        // 1. Get recent transactions (top 5)
        List<TransactionDto> allTransactions = transactionService.getAllTransactions(user);
        List<TransactionDto> recentTransactions = allTransactions.stream()
                .limit(5)
                .collect(Collectors.toList());

        // 2. Generate Monthly Report using Strategy Pattern
        ReportDto monthlyReport = reportContext.getStrategy("MONTHLY")
                .generateReport(user, startOfMonth, endOfMonth);

        // 3. Generate Category Report using Strategy Pattern
        ReportDto categoryReport = reportContext.getStrategy("CATEGORY")
                .generateReport(user, startOfMonth, endOfMonth);

        // 4. Calculate total income/expenses exactly from the current month
        double totalIncome = monthlyReport.getTotalIncome();
        double totalExpense = monthlyReport.getTotalExpense();

        // 5. Calculate Budgets and verify states using State Pattern
        BudgetContext budgetContext = new BudgetContext();
        List<BudgetStatusDto> budgetStatuses = budgetService
                .getBudgetsByMonthAndYear(user, now.getMonthValue(), now.getYear())
                .stream()
                .map(budget -> {
                    // Filter transactions of this month for this category
                    double currentSpending = allTransactions.stream()
                            .filter(t -> t.getCategoryId().equals(budget.getCategoryId()) &&
                                    t.getType() == TransactionType.EXPENSE &&
                                    !t.getDate().isBefore(startOfMonth) &&
                                    !t.getDate().isAfter(endOfMonth))
                            .mapToDouble(TransactionDto::getAmount)
                            .sum();

                    double percentageUsed = (currentSpending / budget.getLimitAmount()) * 100;

                    BudgetStatusDto statusDto = BudgetStatusDto.builder()
                            .budget(budget)
                            .currentSpending(currentSpending)
                            .remainingAmount(budget.getLimitAmount() - currentSpending)
                            .percentageUsed(percentageUsed)
                            .build();

                    // Apply State Pattern
                    budgetContext.applyState(statusDto);

                    return statusDto;
                })
                .collect(Collectors.toList());

        // 6. Assemble everything using the Builder Pattern
        return new DashboardOverviewDto.Builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .recentTransactions(recentTransactions)
                .budgetStatuses(budgetStatuses)
                .monthlyReport(monthlyReport)
                .categoryReport(categoryReport)
                .build();
    }
}
