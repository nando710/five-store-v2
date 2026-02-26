import { useState, useEffect } from 'react';
import {
    Package, Search, Filter, Truck, FileText, MessageSquare, X, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface OrderItem {
    id: string;
    product_name: string;
    product_sku: string;
    quantity: number;
    unit_price: number;
    total_price: number;
}

interface Order {
    id: string;
    created_at: string;
    total_amount: number;
    shipping_cost: number;
    status: string;
    payment_method: string | null;
    shipping_tracking_code: string | null;
    order_items: OrderItem[];
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
    pending: { label: 'Aguardando Pagamento', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    approved: { label: 'Pago', color: 'bg-green-50 text-green-700 border-green-200' },
    processing: { label: 'Em Separação', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    shipped: { label: 'Enviado', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    delivered: { label: 'Entregue', color: 'bg-surface-100 text-surface-600 border-surface-200' },
    cancelled: { label: 'Cancelado', color: 'bg-red-50 text-red-700 border-red-200' },
};

function getSteps(status: string, createdAt: string) {
    const date = new Date(createdAt).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const statuses = ['pending', 'approved', 'processing', 'shipped', 'delivered'];
    const currentIdx = statuses.indexOf(status);
    return [
        { title: 'Pedido Realizado', done: currentIdx >= 0, date: currentIdx >= 0 ? date : null },
        { title: 'Pagamento Aprovado', done: currentIdx >= 1, date: null },
        { title: 'Em Separação', done: currentIdx >= 2, date: null },
        { title: 'Enviado', done: currentIdx >= 3, date: null },
        { title: 'Entregue', done: currentIdx >= 4, date: null },
    ];
}

export function MyOrders() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        if (!user) return;
        const fetchOrders = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*, order_items(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setOrders(data as Order[]);
            } else {
                console.error('Erro ao buscar pedidos:', error?.message);
            }
            setIsLoading(false);
        };
        fetchOrders();
    }, [user]);

    const filtered = orders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (STATUS_MAP[o.status]?.label ?? o.status).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (iso: string) =>
        new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-semibold text-surface-900">Meus Pedidos</h1>
                    <p className="text-surface-500 mt-1">Acompanhe o status e histórico das suas compras.</p>
                </div>
                <button onClick={() => navigate('/store')} className="btn-primary">
                    Novo Pedido
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por ID, status..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-surface-200 rounded-lg bg-surface-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm"
                    />
                </div>
                <button className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center">
                    <Filter size={18} className="text-surface-500" />
                    <span>Filtros</span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-20 text-surface-400 gap-3">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Carregando pedidos...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center text-surface-400 mb-4">
                        <Package size={36} />
                    </div>
                    <h2 className="text-xl font-semibold text-surface-900 mb-2">Nenhum pedido encontrado</h2>
                    <p className="text-surface-500 mb-6">Você ainda não fez nenhum pedido.</p>
                    <button onClick={() => navigate('/store')} className="btn-primary">Ir ao Catálogo</button>
                </div>
            ) : (
                <div className="space-y-6">
                    {filtered.map((order) => {
                        const statusInfo = STATUS_MAP[order.status] ?? { label: order.status, color: 'bg-surface-100 text-surface-600 border-surface-200' };
                        const steps = getSteps(order.status, order.created_at);
                        return (
                            <div key={order.id} className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden group">
                                <div className="p-6 border-b border-surface-200 bg-surface-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-surface-200 rounded-xl flex items-center justify-center text-surface-500">
                                            <Package size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-sm font-mono font-bold text-surface-900">#{order.id.slice(0, 8).toUpperCase()}</h2>
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="text-xs text-surface-500 flex items-center gap-4">
                                                <span>Realizado em {formatDate(order.created_at)}</span>
                                                <span className="w-1 h-1 bg-surface-300 rounded-full"></span>
                                                <span className="font-medium text-surface-700">R$ {order.total_amount.toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full sm:w-auto">
                                        <button className="flex-1 sm:flex-none btn-secondary text-sm flex justify-center items-center gap-2 py-2.5">
                                            <FileText size={16} /> NF-e
                                        </button>
                                        <button className="flex-1 sm:flex-none btn-secondary text-sm flex justify-center items-center gap-2 py-2.5 text-brand-600 border-brand-200 hover:bg-brand-50 hover:border-brand-300">
                                            <MessageSquare size={16} /> Suporte
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row gap-8">
                                        {/* Timeline */}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-surface-900 mb-4 text-sm uppercase tracking-wider">Acompanhamento</h3>
                                            <div className="relative border-l border-surface-200 ml-3 space-y-6">
                                                {steps.map((step, idx) => (
                                                    <div key={idx} className="relative pl-6">
                                                        <span className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${step.done ? 'bg-brand-500' : 'bg-surface-200'}`}></span>
                                                        <p className={`text-sm font-medium ${step.done ? 'text-surface-900' : 'text-surface-400'}`}>{step.title}</p>
                                                        {step.date && <p className="text-xs text-surface-500 mt-0.5">{step.date}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Items + Tracking */}
                                        <div className="w-full md:w-64 space-y-6">
                                            <div>
                                                <h3 className="font-semibold text-surface-900 mb-2 text-sm uppercase tracking-wider">Itens</h3>
                                                <div className="text-sm text-surface-600 px-4 py-3 bg-surface-50 rounded-lg border border-surface-100">
                                                    {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'itens'} neste pedido.
                                                    <button
                                                        onClick={() => { setSelectedOrder(order); setIsDetailsModalOpen(true); }}
                                                        className="text-brand-600 font-medium ml-2 hover:underline"
                                                    >
                                                        Ver detalhes
                                                    </button>
                                                </div>
                                            </div>

                                            {order.shipping_tracking_code && (
                                                <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 relative overflow-hidden">
                                                    <div className="absolute -right-2 -top-2 text-blue-100/50 pointer-events-none">
                                                        <Truck size={64} />
                                                    </div>
                                                    <h3 className="font-semibold text-blue-900 mb-1 relative z-10 flex items-center gap-1.5 text-sm uppercase tracking-wider">
                                                        <Truck size={14} /> Rastreio
                                                    </h3>
                                                    <div className="relative z-10 mt-2">
                                                        <div className="bg-white border border-blue-200 px-3 py-2 rounded text-blue-800 font-mono text-sm font-bold tracking-wider mb-2 text-center">
                                                            {order.shipping_tracking_code}
                                                        </div>
                                                        <button className="w-full text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-1.5 rounded transition-colors">
                                                            Rastrear Objeto
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Order Details Modal */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsDetailsModalOpen(false)}
                            className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10"
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-50/50">
                                <div>
                                    <h2 className="text-xl font-display font-semibold text-surface-900 flex items-center gap-2">
                                        Pedido <span className="text-brand-600 font-mono">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                                    </h2>
                                    <p className="text-sm text-surface-500 mt-0.5">{formatDate(selectedOrder.created_at)}</p>
                                </div>
                                <button onClick={() => setIsDetailsModalOpen(false)} className="p-2 text-surface-400 hover:bg-surface-200 hover:text-surface-700 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-surface-50 space-y-4">
                                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                                    <div className="px-4 py-3 bg-surface-50 border-b border-surface-200 font-semibold text-surface-900 text-sm">
                                        Itens Comprados ({selectedOrder.order_items.length})
                                    </div>
                                    <div className="divide-y divide-surface-100">
                                        {selectedOrder.order_items.map((item) => (
                                            <div key={item.id} className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-surface-100 rounded-lg flex items-center justify-center text-surface-400">
                                                        <Package size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-surface-900 text-sm">{item.product_name}</p>
                                                        <p className="text-xs text-surface-500 font-mono">{item.product_sku}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-surface-900 text-sm">{item.quantity} UN</p>
                                                    <p className="text-xs text-surface-500">R$ {item.unit_price.toFixed(2).replace('.', ',')} / un</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Totals */}
                                <div className="bg-white rounded-2xl border border-surface-200 p-4 space-y-2 text-sm">
                                    <div className="flex justify-between text-surface-600">
                                        <span>Subtotal</span>
                                        <span>R$ {(selectedOrder.total_amount - selectedOrder.shipping_cost).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <div className="flex justify-between text-surface-600">
                                        <span>Frete</span>
                                        <span>R$ {selectedOrder.shipping_cost.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-surface-900 pt-2 border-t border-surface-100">
                                        <span>Total</span>
                                        <span className="text-brand-600">R$ {selectedOrder.total_amount.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-surface-200 bg-white flex justify-end">
                                <button className="btn-secondary py-2" onClick={() => setIsDetailsModalOpen(false)}>Fechar</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
