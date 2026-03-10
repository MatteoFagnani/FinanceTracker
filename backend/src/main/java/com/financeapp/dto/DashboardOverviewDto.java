package com.financeapp.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class DashboardOverviewDto {
    private final Double totalIncome;
    private final Double totalExpense;
    private final Double currentBalance;
    private final List<TransactionDto> recentTransactions;
    private final List<BudgetStatusDto> budgetStatuses;
    private final ReportDto monthlyReport;
    private final ReportDto categoryReport;

    private DashboardOverviewDto(Builder builder) {
        this.totalIncome = builder.totalIncome;
        this.totalExpense = builder.totalExpense;
        this.currentBalance = builder.totalIncome - builder.totalExpense;
        this.recentTransactions = builder.recentTransactions;
        this.budgetStatuses = builder.budgetStatuses;
        this.monthlyReport = builder.monthlyReport;
        this.categoryReport = builder.categoryReport;
    }

    public static class Builder {
        private Double totalIncome = 0.0;
        private Double totalExpense = 0.0;
        private List<TransactionDto> recentTransactions;
        private List<BudgetStatusDto> budgetStatuses;
        private ReportDto monthlyReport;
        private ReportDto categoryReport;

        public Builder totalIncome(Double totalIncome) {
            this.totalIncome = totalIncome;
            return this;
        }

        public Builder totalExpense(Double totalExpense) {
            this.totalExpense = totalExpense;
            return this;
        }

        public Builder recentTransactions(List<TransactionDto> recentTransactions) {
            this.recentTransactions = recentTransactions;
            return this;
        }

        public Builder budgetStatuses(List<BudgetStatusDto> budgetStatuses) {
            this.budgetStatuses = budgetStatuses;
            return this;
        }

        public Builder monthlyReport(ReportDto monthlyReport) {
            this.monthlyReport = monthlyReport;
            return this;
        }

        public Builder categoryReport(ReportDto categoryReport) {
            this.categoryReport = categoryReport;
            return this;
        }

        public DashboardOverviewDto build() {
            return new DashboardOverviewDto(this);
        }
    }
}
