import { useState, useCallback } from 'react';
import { transactionService, categoryService } from '../services/services';
import type { Transaction, Category } from '../types';

export function useTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [txs, cats] = await Promise.all([
                transactionService.getAll(),
                categoryService.getAll(),
            ]);
            setTransactions([...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setCategories(cats);
        } catch {
            setError('Errore durante il caricamento dei dati.');
        } finally {
            setLoading(false);
        }
    }, []);

    const saveTransaction = async (
        id: number | null,
        data: { amount: string | number; date: string; description: string; categoryId: string | number }
    ) => {
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...data,
                amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
                categoryId: typeof data.categoryId === 'string' ? parseInt(data.categoryId) : data.categoryId
            };
            if (id) {
                await transactionService.update(id, payload);
            } else {
                await transactionService.create(payload);
            }
            await loadData();
            return true;
        } catch (err: unknown) {
            const resData = (err as { response?: { data?: Record<string, string> } })?.response?.data;
            setError(resData ? Object.values(resData).join('. ') : 'Errore durante il salvataggio della transazione');
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteTransaction = async (id: number) => {
        try {
            await transactionService.remove(id);
            await loadData();
            return true;
        } catch {
            setError('Impossibile eliminare la transazione.');
            return false;
        }
    };

    return {
        transactions,
        categories,
        loading,
        saving,
        error,
        setError,
        loadData,
        saveTransaction,
        deleteTransaction,
    };
}
