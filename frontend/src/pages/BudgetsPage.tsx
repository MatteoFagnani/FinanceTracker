import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, X, Loader2 } from 'lucide-react';
import { budgetService, categoryService } from '../services/services';
import type { Budget, Category } from '../types';
import { ProgressBar } from '../components/UI';

const inputClass = 'w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
const SHORT_MONTHS = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];

type BudgetStatus = Budget & {
    currentSpending: number;
    remainingAmount: number;
    percentageUsed: number;
    status: string;
};

export default function BudgetsPage() {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Budget | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        categoryId: '', limitAmount: '',
        month: String(month), year: String(year), automatic: false,
    });

    const loadBudgets = () => {
        setLoading(true);
        budgetService.getByMonth(month, year).then(setBudgets).finally(() => setLoading(false));
    };

    useEffect(() => {
        categoryService.getAll().then((cats: Category[]) => setCategories(cats.filter(c => c.type === 'EXPENSE')));
    }, []);

    useEffect(() => { loadBudgets(); }, [month, year]);

    const openNew = () => {
        setEditing(null);
        setForm({ categoryId: '', limitAmount: '', month: String(month), year: String(year), automatic: false });
        setError('');
        setShowForm(true);
    };

    const openEdit = (b: Budget) => {
        setEditing(b);
        setForm({
            categoryId: String(b.categoryId), limitAmount: String(b.limitAmount),
            month: String(b.month), year: String(b.year), automatic: b.automatic,
        });
        setError('');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = {
                ...form,
                categoryId: parseInt(form.categoryId),
                limitAmount: parseFloat(form.limitAmount),
                month: parseInt(form.month),
                year: parseInt(form.year),
            };
            if (editing) {
                await budgetService.update(editing.id, payload);
            } else {
                await budgetService.create(payload);
            }
            setShowForm(false);
            loadBudgets();
        } catch (err: unknown) {
            const data = (err as { response?: { data?: Record<string, string> } })?.response?.data;
            setError(data ? Object.values(data).join('. ') : 'Errore durante il salvataggio del budget');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminare questo budget?')) return;
        await budgetService.remove(id);
        loadBudgets();
    };

    const fmt = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

    return (
        <div className="space-y-5 pb-10">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="appearance-none bg-white border border-gray-300 rounded-xl pl-3.5 pr-8 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
                        >
                            {SHORT_MONTHS.map((m, i) => (
                                <option key={m} value={i + 1}>{m}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="relative">
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="appearance-none bg-white border border-gray-300 rounded-xl pl-3.5 pr-8 py-2.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent cursor-pointer"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                    <Plus size={16} /> Nuovo budget
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-violet-600 rounded-full animate-spin" />
                </div>
            ) : budgets.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl py-16 text-center">
                    <p className="text-sm text-gray-500 mb-1 font-medium">Nessun budget per {SHORT_MONTHS[month - 1]} {year}</p>
                    <p className="text-xs text-gray-400 mb-4">Imposta un budget per tenere sotto controllo le tue spese</p>
                    <button
                        onClick={openNew}
                        className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
                    >
                        Crea il primo budget
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgets.map((b) => {
                        const pct = b.percentageUsed;
                        const color = b.status === 'OK' ? '#10b981' : b.status === 'WARNING' ? '#f59e0b' : '#f43f5e';
                        const isOver = b.remainingAmount < 0;

                        return (
                            <div key={b.id} className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors relative">

                                {/* Actions */}
                                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEdit(b)}
                                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(b.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm font-semibold text-gray-800 mb-0.5">{b.categoryName}</p>
                                    <p className="text-xs text-gray-400">{MONTHS[b.month - 1]} {b.year}</p>
                                </div>

                                <div className="flex items-end justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-0.5">Speso</p>
                                        <p className="text-xl font-bold text-gray-900">{fmt(b.currentSpending)}</p>
                                    </div>
                                    <span className="text-sm font-semibold" style={{ color }}>{Math.round(pct)}%</span>
                                </div>

                                <ProgressBar pct={pct} color={color} />

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs text-gray-400 mb-0.5">Limite</p>
                                        <p className="text-sm font-semibold text-gray-700">{fmt(b.limitAmount)}</p>
                                    </div>
                                    <div className={`rounded-xl p-3 ${isOver ? 'bg-red-50' : 'bg-gray-50'}`}>
                                        <p className="text-xs text-gray-400 mb-0.5">{isOver ? 'Sforato di' : 'Rimanente'}</p>
                                        <p className={`text-sm font-semibold ${isOver ? 'text-red-500' : 'text-gray-700'}`}>
                                            {fmt(Math.abs(b.remainingAmount))}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900">
                                {editing ? 'Modifica budget' : 'Nuovo budget'}
                            </h3>
                            <button
                                onClick={() => setShowForm(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className={labelClass}>Categoria di spesa</label>
                                    <div className="relative">
                                        <select
                                            value={form.categoryId}
                                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                            required
                                            disabled={!!editing}
                                            className={`${inputClass} appearance-none pr-9 disabled:opacity-60 disabled:cursor-not-allowed`}
                                        >
                                            <option value="">Seleziona una categoria</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Limite di spesa (€)</label>
                                    <input
                                        type="number"
                                        value={form.limitAmount}
                                        onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
                                        required min="1" step="0.01"
                                        placeholder="0.00"
                                        className={inputClass}
                                    />
                                </div>

                                {!editing && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Mese</label>
                                            <div className="relative">
                                                <select
                                                    value={form.month}
                                                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                                                    className={`${inputClass} appearance-none pr-9`}
                                                >
                                                    {SHORT_MONTHS.map((m, i) => (
                                                        <option key={m} value={i + 1}>{m}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Anno</label>
                                            <div className="relative">
                                                <select
                                                    value={form.year}
                                                    onChange={(e) => setForm({ ...form, year: e.target.value })}
                                                    className={`${inputClass} appearance-none pr-9`}
                                                >
                                                    {[2024, 2025, 2026, 2027].map(y => (
                                                        <option key={y} value={y}>{y}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Annulla
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
                                    >
                                        {saving ? <Loader2 size={15} className="animate-spin" /> : (editing ? 'Salva modifiche' : 'Crea budget')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}