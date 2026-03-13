export interface Budget {
    id: number;
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    limitAmount: number;
    percentageOfIncome?: number;
    automatic: boolean;
}

export interface BudgetStatus extends Budget {
    month: number;
    year: number;
    currentSpending: number;
    remainingAmount: number;
    percentageUsed: number;
    overridden: boolean;
    status: 'OK' | 'WARNING' | 'EXCEEDED';
}

export interface BudgetUpdateRequest extends Omit<Budget, 'id' | 'categoryName' | 'categoryColor'> {
    type: 'PERMANENT' | 'TEMPORARY';
    month?: number;
    year?: number;
}
