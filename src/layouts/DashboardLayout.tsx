import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Truck,
    Settings,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    Tags,
    Users,
    Store
} from 'lucide-react';

export function DashboardLayout() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Visão Geral', path: '/admin', icon: <LayoutDashboard size={20} />, exact: true },
        { name: 'Franqueados', path: '/admin/franchisees', icon: <Users size={20} /> },
        { name: 'Produtos', path: '/admin/products', icon: <Package size={20} /> },
        { name: 'Categorias', path: '/admin/categories', icon: <Tags size={20} /> },
        { name: 'Pedidos', path: '/admin/orders', icon: <ShoppingCart size={20} /> },
        { name: 'Expedição', path: '/admin/dispatch', icon: <Truck size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-surface-50 flex">
            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-surface-900/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-surface-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:w-64 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-16 flex items-center px-6 border-b border-surface-200">
                    <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30 mr-3">
                        <span className="text-white text-lg font-bold font-display">F</span>
                    </div>
                    <span className="text-xl font-display font-semibold text-surface-900">Five Store</span>

                    <button
                        className="ml-auto lg:hidden text-surface-500 hover:text-surface-900"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                    <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4 px-2">
                        Gestão
                    </div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors
                ${isActive
                                    ? 'bg-brand-50 text-brand-600'
                                    : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                                }
              `}
                        >
                            {item.icon}
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-surface-200">
                    <button
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                    >
                        <Settings size={20} />
                        Configurações
                    </button>
                    <button
                        onClick={() => navigate('/store')}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl font-medium text-brand-600 hover:bg-brand-50 transition-colors mb-1"
                    >
                        <Store size={20} />
                        Ver Loja
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                    >
                        <LogOut size={20} />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-surface-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10">
                    <button
                        className="lg:hidden text-surface-500 hover:text-surface-900"
                        onClick={() => setIsMobileMenuOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 flex items-center justify-end gap-4 sm:gap-6">
                        <div className="hidden sm:flex items-center bg-surface-100 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-brand-500/30 focus-within:bg-white transition-all">
                            <Search size={18} className="text-surface-400 mr-2" />
                            <input
                                type="text"
                                placeholder="Buscar pedidos, produtos..."
                                className="bg-transparent border-none outline-none w-full text-sm text-surface-900 placeholder:text-surface-400"
                            />
                        </div>

                        <button className="relative p-2 text-surface-500 hover:bg-surface-100 rounded-full transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-surface-200">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-sm font-medium text-surface-900">{user?.name}</span>
                                <span className="text-xs text-surface-500 capitalize">{user?.role}</span>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold border border-brand-200 uppercase">
                                {user?.name.charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
