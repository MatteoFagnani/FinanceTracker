import { useState, useCallback } from 'react';
import { budgetService, categoryService } from '../services/services';
import type { Budget, Category } from '../types';

export type BudgetStatus = Budget & {
    currentSpending: number;
    remainingAmount: number;
    percentageUsed: number;
    status: string;
    percentageOfIncome?: number;
};

export function useBudgets(month: number, year: number) {
    const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [b, c] = await Promise.all([
                budgetService.getByMonth(month, year),
                categoryService.getAll(),
            ]);
            setBudgets(b);
            setCategories(c.filter(cat => cat.type === 'EXPENSE'));
        } catch {
            setError('Errore durante il caricamento dei budget.');
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    const saveBudget = async (id: number | null, form: { categoryId: string; limitAmount: string; percentageOfIncome?: string; month: string; year: string; automatic: boolean }) => {
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                categoryId: parseInt(form.categoryId),
                limitAmount: form.limitAmount ? parseFloat(form.limitAmount) : 0,
                percentageOfIncome: form.percentageOfIncome ? parseFloat(form.percentageOfIncome) : null,
                month: parseInt(form.month),
                year: parseInt(form.year),
            };
            if (id) {
                await budgetService.update(id, payload);
            } else {
                await budgetService.create(payload);
            }
            await loadData();
            return true;
        } catch (err: unknown) {
            const data = (err as { response?: { data?: Record<string, string> } })?.response?.data;
            setError(data ? Object.values(data).join('. ') : 'Errore durante il salvataggio del budget');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteBudget = async (id: number) => {
        try {
            await budgetService.remove(id);
            await loadData();
            return true;
        } catch {
            setError('Impossibile eliminare il budget.');
            return false;
        }
    };

    return {
        budgets,
        categories,
        loading,
        saving,
        error,
        setError,
        loadData,
        saveBudget,
        deleteBudget,
    };
}
