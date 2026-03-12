import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Transaction, TransactionType } from '../types';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import { useTransactions } from '../hooks/useTransactions';

export default function TransactionsPage() {
    const { transactions, categories, loading, saving, error, setError, loadData, saveTransaction, deleteTransaction } = useTransactions();

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'ALL' | TransactionType>('ALL');
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        categoryId: '',
    });

    useEffect(() => {
        loadData();
    }, [loadData]);

    const openNew = () => {
        setEditing(null);
        setFormData({ amount: '', date: new Date().toISOString().split('T')[0], description: '', categoryId: '' });
        setError('');
        setShowForm(true);
    };

    const openEdit = (tx: Transaction) => {
        setEditing(tx);
        setFormData({ amount: String(tx.amount), date: tx.date, description: tx.description || '', categoryId: String(tx.categoryId) });
        setError('');
        setShowForm(true);
    };

    const handleSave = async (form: { amount: string; date: string; description: string; categoryId: string }) => {
        const success = await saveTransaction(editing ? editing.id : null, form);
        if (success) {
            setShowForm(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminare questa transazione?')) return;
        await deleteTransaction(id);
    };

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

            <TransactionList
                transactions={filtered}
                loading={loading}
                onEdit={openEdit}
                onDelete={handleDelete}
            />

            {showForm && (
                <TransactionForm
                    editing={editing}
                    categories={categories}
                    initialData={formData}
                    saving={saving}
                    error={error}
                    onSave={handleSave}
                    onClose={() => setShowForm(false)}
                />
            )}
        </div>
    );
}