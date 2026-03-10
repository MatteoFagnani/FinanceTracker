import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X, ChevronDown, Loader2 } from 'lucide-react';
import { transactionService, categoryService } from '../services/services';
import type { Transaction, Category, TransactionType } from '../types';

const inputClass = 'w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        categoryId: '',
    });

    const load = () => {
        setLoading(true);
        Promise.all([transactionService.getAll(), categoryService.getAll()])
            .then(([txs, cats]) => {
                setTransactions([...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                setCategories(cats);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openNew = () => {
        setEditing(null);
        setForm({ amount: '', date: new Date().toISOString().split('T')[0], description: '', categoryId: '' });
        setError('');
        setShowForm(true);
    };

    const openEdit = (tx: Transaction) => {
        setEditing(tx);
        setForm({ amount: String(tx.amount), date: tx.date, description: tx.description || '', categoryId: String(tx.categoryId) });
        setError('');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const payload = { ...form, amount: parseFloat(form.amount), categoryId: parseInt(form.categoryId) };
            if (editing) {
                await transactionService.update(editing.id, payload);
            } else {
                await transactionService.create(payload);
            }
            setShowForm(false);
            load();
        } catch (err: unknown) {
            const data = (err as { response?: { data?: Record<string, string> } })?.response?.data;
            setError(data ? Object.values(data).join('. ') : 'Errore durante il salvataggio della transazione');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminare questa transazione?')) return;
        await transactionService.remove(id);
        load();
    };

    const fmt = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

    const filtered = transactions
        .filter(t => filter === 'ALL' || t.type === filter)
        .filter(t => !search || (t.description || t.categoryName || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-5 pb-10">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cerca transazioni..."
                            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-1 flex-shrink-0">
                        {(['ALL', 'INCOME', 'EXPENSE'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f
                                    ? 'bg-violet-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {f === 'ALL' ? 'Tutte' : f === 'INCOME' ? 'Entrate' : 'Uscite'}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors flex-shrink-0"
                >
                    <Plus size={16} /> Nuova transazione
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-violet-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-sm text-gray-400">Nessuna transazione trovata</p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3.5">Descrizione</th>
                                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3.5 hidden md:table-cell">Categoria</th>
                                <th className="text-left text-xs font-medium text-gray-400 px-5 py-3.5 hidden md:table-cell">Data</th>
                                <th className="text-right text-xs font-medium text-gray-400 px-5 py-3.5">Importo</th>
                                <th className="px-5 py-3.5 w-20" />
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                            {filtered.map((tx) => (
                                <tr key={tx.id} className="group hover:bg-gray-50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                style={{ backgroundColor: `${tx.categoryColor || '#7c3aed'}15`, color: tx.categoryColor || '#7c3aed' }}
                                            >
                                                {tx.categoryName?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{tx.description || tx.categoryName}</p>
                                                {tx.automatic && (
                                                    <span className="text-xs text-violet-600 font-medium">Automatica</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                            <span
                                                className="text-xs font-medium px-2.5 py-1 rounded-full"
                                                style={{ backgroundColor: `${tx.categoryColor}15`, color: tx.categoryColor }}
                                            >
                                                {tx.categoryName}
                                            </span>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className="text-sm text-gray-500">{tx.date}</span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                            <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-gray-800'}`}>
                                                {tx.type === 'INCOME' ? '+' : ''}{fmt(tx.amount)}
                                            </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {!tx.automatic && (
                                            <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(tx)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900">
                                {editing ? 'Modifica transazione' : 'Nuova transazione'}
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
                                    <label className={labelClass}>Categoria</label>
                                    <div className="relative">
                                        <select
                                            value={form.categoryId}
                                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                            required
                                            className={`${inputClass} appearance-none pr-9`}
                                        >
                                            <option value="">Seleziona una categoria</option>
                                            {categories.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.type === 'INCOME' ? 'Entrata' : 'Uscita'})</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>Importo (€)</label>
                                        <input
                                            type="number"
                                            value={form.amount}
                                            onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                            required min="0.01" step="0.01"
                                            placeholder="0.00"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Data</label>
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                                            required
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Descrizione <span className="text-gray-400 font-normal">(opzionale)</span></label>
                                    <input
                                        type="text"
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Es. Spesa supermercato"
                                        className={inputClass}
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
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
                                        {saving ? <Loader2 size={15} className="animate-spin" /> : (editing ? 'Salva modifiche' : 'Aggiungi')}
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