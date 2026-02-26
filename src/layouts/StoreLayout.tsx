import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, PackageSearch, CreditCard, ChevronDown, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { AnimatePresence, motion } from 'framer-motion';

export function StoreLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, user } = useAuth();
    const { totalItems: cartCount } = useCart();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-surface-50 flex flex-col">
            {/* Top Announcement Bar */}
            <div className="bg-brand-900 text-brand-50 text-xs py-2 text-center font-medium">
                Aviso: Novos insumos disponíveis para pedido através do catálogo atualizado.
            </div>

            {/* Main Header */}
            <header className="bg-white border-b border-surface-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">

                    {/* Logo and Branding */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/store')}>
                        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                            <span className="text-white text-xl font-bold font-display">F</span>
                        </div>
                        <div>
                            <span className="text-xl font-display font-semibold text-surface-900 block leading-none">Five Store</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-surface-400">Portal do Franqueado</span>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <NavLink to="/store" end className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-surface-600 hover:text-surface-900'}`}>
                            Catálogo
                        </NavLink>
                        <NavLink to="/store/orders" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-surface-600 hover:text-surface-900'}`}>
                            Meus Pedidos
                        </NavLink>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Admin shortcut — only visible to admin users */}
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 transition-colors"
                                title="Ir para o Painel Admin"
                            >
                                <LayoutDashboard size={14} />
                                Painel Admin
                            </button>
                        )}

                        {/* Cart Button */}
                        <button
                            onClick={() => navigate('/store/cart')}
                            className="relative p-2 text-surface-600 hover:bg-surface-100 rounded-full transition-colors group"
                        >
                            <ShoppingCart size={22} className="group-hover:text-surface-900 transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <div className="w-px h-8 bg-surface-200 hidden sm:block"></div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <div
                                className="flex items-center gap-3 cursor-pointer group"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-medium text-surface-900 leading-none group-hover:text-brand-600 transition-colors uppercase">{user?.storeName || user?.name}</p>
                                    <p className="text-xs text-surface-500 mt-1 flex items-center justify-end gap-1">
                                        Minha Conta <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold border border-brand-200 group-hover:bg-brand-600 group-hover:text-white transition-colors shadow-sm uppercase">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-3 w-48 bg-white border border-surface-200 rounded-xl shadow-lg shadow-surface-900/5 py-1 z-50 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                navigate('/store/profile');
                                            }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 hover:text-brand-600 transition-colors"
                                        >
                                            Ver Perfil
                                        </button>
                                        <div className="h-px bg-surface-100 mx-3 my-1"></div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center justify-between transition-colors"
                                        >
                                            Sair da conta
                                            <LogOut size={14} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="h-full"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-surface-200 py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-surface-400">
                        <div className="w-6 h-6 bg-surface-200 rounded flex items-center justify-center">
                            <span className="text-surface-500 text-xs font-bold font-display">F</span>
                        </div>
                        <span className="text-sm">© 2026 Five Brasil. Todos os direitos reservados.</span>
                    </div>
                    <div className="flex gap-4 text-sm text-surface-400">
                        <span className="flex items-center gap-1"><PackageSearch size={14} /> Suporte</span>
                        <span className="flex items-center gap-1"><CreditCard size={14} /> Financeiro</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
