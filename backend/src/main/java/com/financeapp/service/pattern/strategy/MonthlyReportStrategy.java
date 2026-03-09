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
public class MonthlyReportStrategy implements ReportStrategy {

    private final TransactionRepository transactionRepository;

    @Override
    public ReportDto generateReport(User user, LocalDate startDate, LocalDate endDate) {
        List<Transaction> transactions = transactionRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), startDate, endDate);

        double totalIncome = 0.0;
        double totalExpense = 0.0;

        // DataPoints: Map "Day" -> "Net Balance"
        Map<String, Double> dailyBalances = new LinkedHashMap<>();

        // Initialize map
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            dailyBalances.put(currentDate.toString(), 0.0);
            currentDate = currentDate.plusDays(1);
        }

        for (Transaction t : transactions) {
            String day = t.getDate().toString();
            double amount = t.getAmount();

            if (t.getType() == TransactionType.INCOME) {
                totalIncome += amount;
                dailyBalances.put(day, dailyBalances.get(day) + amount);
            } else {
                totalExpense += amount;
                dailyBalances.put(day, dailyBalances.get(day) - amount);
            }
        }

        return ReportDto.builder()
                .title("Monthly Financial Report")
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netBalance(totalIncome - totalExpense)
                .dataPoints(dailyBalances)
                .build();
    }
}
