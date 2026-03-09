package com.financeapp.service.pattern.strategy;

import com.financeapp.dto.ReportDto;
import com.financeapp.model.Transaction;
import com.financeapp.model.TransactionType;
import com.financeapp.model.User;
import com.financeapp.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CategoryReportStrategy implements ReportStrategy {

    private final TransactionRepository transactionRepository;

    @Override
    public ReportDto generateReport(User user, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), startDate, endDate);

        double totalIncome = 0.0;
        double totalExpense = 0.0;

        // DataPoints: Map "CategoryName" -> "Total Amount for that category"
        Map<String, Double> categoryTotals = new LinkedHashMap<>();

        for (Transaction t : transactions) {
            String categoryName = t.getCategory().getName();
            double amount = t.getAmount();

            categoryTotals.put(categoryName, categoryTotals.getOrDefault(categoryName, 0.0) + amount);

            if (t.getType() == TransactionType.INCOME) {
                totalIncome += amount;
            } else {
                totalExpense += amount;
            }
        }

        return ReportDto.builder()
                .title("Category Financial Report")
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(totalIncome - totalExpense)
                .dataPoints(categoryTotals)
                .build();
    }
}
