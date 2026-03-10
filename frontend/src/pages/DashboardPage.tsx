import { useEffect, useState } from 'react';
import { dashboardService } from '../services/services';
import type { DashboardOverview } from '../types';
import { ProgressBar } from '../components/UI';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, Target, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PIE_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

function CustomTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} className="text-sm font-semibold text-gray-800">
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(p.value)}
                </p>
            ))}
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string;
    sub: string;
    positive: boolean;
    icon: React.ReactNode;
    iconColor: string;
}

function StatCard({ label, value, sub, positive, icon, iconColor }: StatCardProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{label}</p>
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${iconColor}15`, color: iconColor }}>
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs mt-1 font-medium ${positive ? 'text-emerald-600' : 'text-red-500'}`}>{sub}</p>
        </div>
    );
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        dashboardService.getOverview()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
        );
    }

    const fmt = (n: number) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);

    const monthlyChartData = data?.monthlyReport?.dataPoints
        ? Object.entries(data.monthlyReport.dataPoints).map(([date, val]) => ({
            date: new Date(date).toLocaleDateString('it-IT', { month: 'short' }),
            net: val,
        }))
        : [];

    const categoryChartData = data?.categoryReport?.dataPoints
        ? Object.entries(data.categoryReport.dataPoints)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
        : [];

    const balance = (data?.totalIncome ?? 0) - (data?.totalExpense ?? 0);
    const savingsRate = data?.totalIncome ? Math.round((balance / data.totalIncome) * 100) : 0;
    const categoryTotal = categoryChartData.reduce((acc, c) => acc + c.value, 0);

    return (
        <div className="space-y-5 pb-10">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Saldo netto"
                    value={fmt(balance)}
                    sub={balance >= 0 ? 'In positivo' : 'In negativo'}
                    positive={balance >= 0}
                    icon={<Wallet size={16} />}
                    iconColor="#7c3aed"
                />
                <StatCard
                    label="Entrate totali"
                    value={fmt(data?.totalIncome ?? 0)}
                    sub="Questo periodo"
                    positive={true}
                    icon={<TrendingUp size={16} />}
                    iconColor="#10b981"
                />
                <StatCard
                    label="Uscite totali"
                    value={fmt(data?.totalExpense ?? 0)}
                    sub="Questo periodo"
                    positive={false}
                    icon={<TrendingDown size={16} />}
                    iconColor="#f43f5e"
                />
                <StatCard
                    label="Tasso di risparmio"
                    value={`${savingsRate}%`}
                    sub="Del reddito totale"
                    positive={savingsRate >= 0}
                    icon={<Target size={16} />}
                    iconColor="#06b6d4"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Flusso netto mensile</h2>
                    <p className="text-xs text-gray-400 mb-5">Andamento del saldo nel tempo</p>
                    <div className="h-[250px]">
                        {monthlyChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.12} />
                                            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="net" stroke="#7c3aed" strokeWidth={2} fill="url(#netGradient)" dot={false} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-400">Nessun dato disponibile</div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <h2 className="text-sm font-semibold text-gray-900 mb-0.5">Spese per categoria</h2>
                    <p className="text-xs text-gray-400 mb-4">Distribuzione delle uscite</p>
                    <div className="h-[150px]">
                        {categoryChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryChartData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={68} strokeWidth={0}>
                                        {categoryChartData.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-gray-400">Nessun dato</div>
                        )}
                    </div>
                    <div className="mt-4 space-y-2">
                        {categoryChartData.slice(0, 4).map((item, i) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                    <span className="text-xs text-gray-600 truncate max-w-[100px]">{item.name}</span>
                                </div>
                                <span className="text-xs font-medium text-gray-500">
                                    {categoryTotal > 0 ? Math.round((item.value / categoryTotal) * 100) : 0}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">Transazioni recenti</h2>
                        <button
                            onClick={() => navigate('/transactions')}
                            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors"
                        >
                            Vedi tutte <ChevronRight size={13} />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {data?.recentTransactions?.length ? (
                            data.recentTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                        style={{ backgroundColor: `${tx.categoryColor || '#7c3aed'}15`, color: tx.categoryColor || '#7c3aed' }}
                                    >
                                        {tx.categoryName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{tx.description || tx.categoryName}</p>
                                        <p className="text-xs text-gray-400">{tx.date}</p>
                                    </div>
                                    <span className={`text-sm font-semibold flex-shrink-0 ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-gray-700'}`}>
                                        {tx.type === 'INCOME' ? '+' : ''}{fmt(tx.amount)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 py-8 text-center">Nessuna transazione recente</p>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-gray-900">Budget del mese</h2>
                        <button
                            onClick={() => navigate('/budgets')}
                            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium transition-colors"
                        >
                            Vedi tutti <ChevronRight size={13} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {data?.budgetStatuses?.length ? (
                            data.budgetStatuses.slice(0, 4).map((bs) => {
                                const pct = bs.percentageUsed;
                                const color = bs.status === 'OK' ? '#10b981' : bs.status === 'WARNING' ? '#f59e0b' : '#f43f5e';
                                return (
                                    <div key={bs.id}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700">{bs.categoryName}</span>
                                                {bs.percentageUsed >= 95 && (
                                                    <span className="text-xs text-red-500 font-medium">Quasi esaurito</span>
                                                )}
                                            </div>
                                            <span className="text-xs font-semibold" style={{ color }}>{Math.round(pct)}%</span>
                                        </div>
                                        <ProgressBar pct={pct} color={color} />
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-400 py-8 text-center">Nessun budget configurato</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}