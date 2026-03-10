import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tags, ArrowLeftRight, Zap, Target, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Panoramica' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'Transazioni' },
    { to: '/budgets', icon: Target, label: 'Budget' },
    { to: '/categories', icon: Tags, label: 'Categorie' },
    { to: '/automations', icon: Zap, label: 'Automazioni' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const currentPage = navItems.find((i) => i.to === location.pathname)?.label ?? 'Panoramica';

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">

            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 flex flex-col bg-white border-r border-gray-200">

                {/* Brand */}
                <div
                    className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 cursor-pointer"
                    onClick={() => navigate('/')}
                >
                    <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="text-base font-semibold text-gray-900">Finance Tracker</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                    ? 'bg-violet-50 text-violet-700'
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }`
                            }
                        >
                            <Icon size={17} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* User */}
                <div className="px-3 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
                        <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-700 flex-shrink-0">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-medium text-gray-700 truncate">{user?.username}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={16} />
                        Esci
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <header className="h-14 flex items-center px-8 bg-white border-b border-gray-200 flex-shrink-0">
                    <h1 className="text-base font-semibold text-gray-900">{currentPage}</h1>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="max-w-screen-xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}