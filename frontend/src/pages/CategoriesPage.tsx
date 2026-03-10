import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { categoryService } from '../services/services';
import type { Category, TransactionType } from '../types';

const DEFAULT_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f43f5e', '#3b82f6', '#ec4899', '#64748b', '#f59e0b'];

const inputClass = 'w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [form, setForm] = useState({ name: '', type: 'EXPENSE' as TransactionType, color: DEFAULT_COLORS[0] });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        categoryService.getAll().then(setCategories).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const openNew = () => {
        setEditing(null);
        setForm({ name: '', type: 'EXPENSE', color: DEFAULT_COLORS[0] });
        setError('');
        setShowForm(true);
    };

    const openEdit = (cat: Category) => {
        setEditing(cat);
        setForm({ name: cat.name, type: cat.type, color: cat.color });
        setError('');
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            if (editing) {
                await categoryService.update(editing.id, form);
            } else {
                await categoryService.create(form);
            }
            setShowForm(false);
            load();
        } catch (err: unknown) {
            const data = (err as { response?: { data?: Record<string, string> } })?.response?.data;
            setError(data ? Object.values(data).join('. ') : 'Errore durante il salvataggio della categoria');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Eliminare questa categoria? Le transazioni collegate potrebbero essere influenzate.')) return;
        await categoryService.remove(id);
        load();
    };

    const income = categories.filter((c) => c.type === 'INCOME');
    const expense = categories.filter((c) => c.type === 'EXPENSE');

    const sections = [
        { label: 'Entrate', items: income, type: 'INCOME' as const, accent: '#10b981' },
        { label: 'Uscite', items: expense, type: 'EXPENSE' as const, accent: '#7c3aed' },
    ];

    return (
        <div className="space-y-8 pb-10">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div />
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                    <Plus size={16} /> Nuova categoria
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-violet-600 rounded-full animate-spin" />
                </div>
            ) : (
                <div className="space-y-10">
                    {sections.map(({ label, items, type, accent }) => (
                        <div key={label}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                                <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length}</span>
                            </div>

                            {items.length === 0 ? (
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl py-12 text-center">
                                    <p className="text-sm text-gray-400 mb-3">Nessuna categoria</p>
                                    <button
                                        onClick={openNew}
                                        className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
                                    >
                                        Aggiungine una
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    {items.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold"
                                                    style={{ backgroundColor: `${cat.color}18`, color: cat.color }}
                                                >
                                                    {cat.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span
                                                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                                                    style={{ backgroundColor: `${type === 'INCOME' ? '#10b981' : '#7c3aed'}10`, color: type === 'INCOME' ? '#10b981' : '#7c3aed' }}
                                                >
                                                    {type === 'INCOME' ? 'Entrata' : 'Uscita'}
                                                </span>
                                            </div>

                                            <p className="text-sm font-semibold text-gray-800 mb-1">{cat.name}</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-3 h-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: cat.color }} />
                                                <span className="text-xs text-gray-400 font-mono">{cat.color}</span>
                                            </div>

                                            <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(cat)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={12} /> Modifica
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.id)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={12} /> Elimina
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-base font-semibold text-gray-900">
                                {editing ? 'Modifica categoria' : 'Nuova categoria'}
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

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className={labelClass}>Nome</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                        placeholder="Es. Spesa alimentare"
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Tipo</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {(['INCOME', 'EXPENSE'] as const).map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setForm({ ...form, type: t })}
                                                className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${form.type === t
                                                    ? 'bg-violet-600 border-violet-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                                                }`}
                                            >
                                                {t === 'INCOME' ? 'Entrata' : 'Uscita'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Colore</label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {DEFAULT_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setForm({ ...form, color })}
                                                className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${form.color === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

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
                                        {saving ? <Loader2 size={15} className="animate-spin" /> : (editing ? 'Salva' : 'Crea categoria')}
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