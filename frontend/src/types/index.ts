export interface User {
    id: number;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
    token: string;
    user: User;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
    id: number;
    name: string;
    type: TransactionType;
    color: string;
}

export interface Transaction {
    id: number;
    amount: number;
    type: TransactionType;
    date: string;
    description: string;
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    automatic: boolean;
}

export interface AutomationRule {
    id: number;
    name: string;
    type: TransactionType;
    categoryId: number;
    categoryName: string;
    executionDay: number;
    percentageOfIncome?: number;
    fixedAmount?: number;
}

export interface Budget {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    month: number;
    year: number;
    limitAmount: number;
    automatic: boolean;
}

export interface BudgetStatus extends Budget {
    currentSpending: number;
    remainingAmount: number;
    percentageUsed: number;
    status: 'OK' | 'WARNING' | 'EXCEEDED';
}

export interface ReportDto {
    title: string;
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    dataPoints: Record<string, number>;
}

export interface DashboardOverview {
    totalIncome: number;
    totalExpense: number;
    currentBalance: number;
    recentTransactions: Transaction[];
    budgetStatuses: BudgetStatus[];
    monthlyReport: ReportDto;
    categoryReport: ReportDto;
}
