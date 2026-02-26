import { useState } from 'react';
import {
    Search,
    Filter,
    Eye,
    Download,
    CheckCircle2,
    Clock,
    Package,
    Truck,
    X,
    MapPin,
    CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';

export function Orders() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:user_id (store_name, name, location),
                    order_items (*)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedOrders = (data || []).map(order => ({
                id: order.id.slice(0, 8).toUpperCase(), // Short visual ID
                originalId: order.id,
                franchise: order.profiles?.store_name || 'Desconhecida',
                customer: order.profiles?.name || 'Cliente',
                location: order.profiles?.location || 'Endereço não informado',
                date: new Date(order.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                amount: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount),
                items: order.order_items?.length || 0,
                orderItems: order.order_items || [],
                status: translateStatus(order.status),
                paymentMethod: order.payment_method || 'Pix'
            }));

            setOrders(formattedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const translateStatus = (dbStatus: string) => {
        switch (dbStatus) {
            case 'pending': return 'Aguardando Pagamento';
            case 'approved': return 'Pago';
            case 'processing': return 'Em Separação';
            case 'shipped': return 'Enviado';
            case 'delivered': return 'Entregue';
            case 'cancelled': return 'Cancelado';
            default: return 'Desconhecido';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Pago': return <CheckCircle2 size={14} className="mr-1.5" />;
            case 'Em Separação': return <Package size={14} className="mr-1.5" />;
            case 'Enviado': return <Truck size={14} className="mr-1.5" />;
            case 'Aguardando Pagamento': return <Clock size={14} className="mr-1.5" />;
            case 'Entregue': return <CheckCircle2 size={14} className="mr-1.5" />;
            case 'Cancelado': return <X size={14} className="mr-1.5" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pago': return 'bg-green-50 text-green-700 border-green-200';
            case 'Em Separação': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Enviado': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'Aguardando Pagamento': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Entregue': return 'bg-surface-100 text-surface-600 border-surface-200';
            case 'Cancelado': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-surface-100 text-surface-600 border-surface-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-display font-semibold text-surface-900">Pedidos</h1>
                    <p className="text-surface-500 text-sm mt-1">Acompanhe todos os pedidos realizados pelas franquias.</p>
                </div>
                <button className="btn-secondary flex items-center gap-2">
                    <Download size={18} />
                    Exportar CSV
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por ID, Franquia ou Cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-surface-200 rounded-lg bg-surface-50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-surface-500" />
                        <span className="text-sm font-medium text-surface-700">Período:</span>
                        <input type="date" className="bg-white border text-sm border-surface-200 text-surface-700 rounded-lg px-2 py-1.5 outline-none focus:border-brand-500" />
                    </div>
                    <select className="bg-white border text-sm border-surface-200 text-surface-700 rounded-lg px-3 py-2 outline-none focus:border-brand-500">
                        <option>Todos os Status</option>
                        <option>Aguardando Pag.</option>
                        <option>Pago</option>
                        <option>Em Separação</option>
                        <option>Enviado</option>
                        <option>Entregue</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-50 text-surface-500 uppercase text-xs font-semibold">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-xl">Pedido</th>
                                <th className="px-6 py-4">Franquia & Cliente</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Valor & Pagamento</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right rounded-tr-xl">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100 text-surface-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-surface-500">
                                        Carregando pedidos...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-surface-500">
                                        Nenhum pedido encontrado.
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order.originalId} className="hover:bg-surface-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-mono font-bold text-surface-900">#{order.id}</div>
                                        <div className="text-xs text-surface-500 mt-0.5">{order.items} itens</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-surface-900">{order.franchise}</div>
                                        <div className="text-xs text-surface-500 mt-0.5">{order.customer}</div>
                                    </td>
                                    <td className="px-6 py-4 text-surface-500">
                                        {order.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-surface-900">{order.amount}</div>
                                        <div className="text-xs text-surface-500 mt-0.5">Asaas - {order.paymentMethod}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setIsDetailsModalOpen(true);
                                            }}
                                            className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5 opacity-0 sm:opacity-100 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Eye size={14} />
                                            Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="p-4 border-t border-surface-200 flex items-center justify-between text-sm text-surface-500">
                    <span>Mostrando 1 a 5 de 156 pedidos</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 rounded border border-surface-200 disabled:opacity-50">Anterior</button>
                        <button className="px-3 py-1 rounded bg-brand-50 text-brand-600 font-medium border border-brand-200">1</button>
                        <button className="px-3 py-1 rounded border border-surface-200 hover:bg-surface-50">2</button>
                        <button className="px-3 py-1 rounded border border-surface-200 hover:bg-surface-50">3</button>
                        <span className="px-2 py-1">...</span>
                        <button className="px-3 py-1 rounded border border-surface-200 hover:bg-surface-50">32</button>
                        <button className="px-3 py-1 rounded border border-surface-200">Próxima</button>
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {isDetailsModalOpen && selectedOrder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDetailsModalOpen(false)}
                            className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-50/50">
                                <div>
                                    <h2 className="text-xl font-display font-semibold text-surface-900 flex items-center gap-2">
                                        Detalhes do Pedido <span className="text-brand-600">#{selectedOrder.id}</span>
                                    </h2>
                                    <p className="text-sm text-surface-500 mt-0.5">{selectedOrder.date}</p>
                                </div>
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="p-2 text-surface-400 hover:bg-surface-200 hover:text-surface-700 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 bg-surface-50 space-y-6">
                                {/* Order Overview Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-surface-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                                                <MapPin size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-surface-900 text-sm">Franquia / Cliente</h3>
                                                <p className="text-xs text-surface-500">Dados de Entrega</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-surface-900 text-sm">{selectedOrder.franchise}</p>
                                            <p className="text-surface-600 text-sm">{selectedOrder.customer}</p>
                                            <p className="text-surface-500 text-xs mt-2 break-words whitespace-pre-wrap">{selectedOrder.location}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-surface-200">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                                <CreditCard size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-surface-900 text-sm">Pagamento</h3>
                                                <p className="text-xs text-surface-500">Gateway: Asaas</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-surface-500">Método:</span>
                                                <span className="font-medium text-surface-900">{selectedOrder.paymentMethod}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-surface-500">Status:</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(selectedOrder.status)}`}>
                                                    {selectedOrder.status}
                                                </span>
                                            </div>
                                            <div className="border-t border-surface-100 pt-2 mt-2 flex justify-between items-center">
                                                <span className="font-medium text-surface-900">Total:</span>
                                                <span className="font-bold text-brand-600 text-lg">{selectedOrder.amount}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
                                    <div className="px-4 py-3 bg-surface-50 border-b border-surface-200 font-semibold text-surface-900 text-sm">
                                        Itens do Pedido ({selectedOrder.items})
                                    </div>
                                    <div className="divide-y divide-surface-100">
                                        {selectedOrder.orderItems?.length > 0 ? selectedOrder.orderItems.map((item: any, idx: number) => (
                                            <div key={idx} className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3 relative">
                                                    <div className="w-12 h-12 bg-surface-100 rounded-lg flex items-center justify-center text-surface-400">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-surface-900 text-sm">{item.product_name}</p>
                                                        <p className="text-xs text-surface-500 font-mono">{item.product_sku}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-surface-900 text-sm">{item.quantity} UN</p>
                                                    <p className="text-xs text-surface-500">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)} / un
                                                    </p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="p-4 text-center text-surface-500 text-sm">
                                                Nenhum item encontrado.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-surface-200 bg-white flex justify-end gap-3">
                                <button className="btn-secondary py-2" onClick={() => setIsDetailsModalOpen(false)}>
                                    Fechar
                                </button>
                                <button className="btn-primary py-2 flex items-center gap-2">
                                    <Download size={16} /> Nota Fiscal
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
