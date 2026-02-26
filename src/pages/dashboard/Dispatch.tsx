import { useState } from 'react';
import {
    Search,
    Package,
    Truck,
    ArrowRight,
    ClipboardList,
    CheckCircle,
    FileText,
    X,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';
export function Dispatch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [isSeparating, setIsSeparating] = useState(false);
    const [isGeneratingTag, setIsGeneratingTag] = useState(false);
    const [trackingCode, setTrackingCode] = useState('');

    const [dispatchQueue, setDispatchQueue] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const activeOrder = dispatchQueue[selectedIndex];

    useEffect(() => {
        fetchQueue();
    }, []);

    const fetchQueue = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:user_id (store_name),
                    order_items (*)
                `)
                .in('status', ['approved', 'processing'])
                .order('created_at', { ascending: true });

            if (error) throw error;

            const formattedQueue = (data || []).map(order => ({
                id: order.id.slice(0, 8).toUpperCase(),
                originalId: order.id,
                franchise: order.profiles?.store_name || 'Desconhecida',
                date: new Date(order.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                items: order.order_items?.length || 0,
                orderItems: order.order_items || [],
                status: order.status === 'approved' ? 'Pago' : 'Em Separação',
                rawStatus: order.status,
                priority: 'Normal',
            }));

            setDispatchQueue(formattedQueue);
            setIsSeparating(formattedQueue[selectedIndex]?.rawStatus === 'processing');
        } catch (error) {
            console.error('Error fetching dispatch queue:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSeparation = async () => {
        if (!activeOrder) return;

        const newStatus = activeOrder.rawStatus === 'approved' ? 'processing' : 'shipped';

        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', activeOrder.originalId);

            if (error) throw error;

            // Reload and optionally advance index if it shipped
            if (newStatus === 'shipped') {
                setSelectedIndex(0);
                setIsSeparating(false);
            } else {
                setIsSeparating(true);
            }
            fetchQueue();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Erro ao atualizar status do pedido.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-display font-semibold text-surface-900">Módulo de Expedição</h1>
                    <p className="text-surface-500 text-sm mt-1">Fila de pedidos pagos aguardando processamento e envio.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Queue List */}
                <div className="md:col-span-1 flex flex-col gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar pedido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-surface-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm shadow-sm"
                        />
                    </div>

                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-16rem)]">
                        <div className="p-4 border-b border-surface-200 bg-surface-50 flex justify-between items-center">
                            <span className="font-semibold text-surface-900">Fila ({dispatchQueue.length})</span>
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {isLoading ? (
                                <div className="text-center p-4 text-surface-500 text-sm">Carregando fila...</div>
                            ) : dispatchQueue.length === 0 ? (
                                <div className="text-center p-4 text-surface-500 text-sm">Fila vazia. Tudo sob controle!</div>
                            ) : dispatchQueue.map((order, idx) => (
                                <div
                                    key={order.originalId}
                                    onClick={() => {
                                        setSelectedIndex(idx);
                                        setIsSeparating(order.rawStatus === 'processing');
                                    }}
                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${idx === selectedIndex
                                        ? 'border-brand-500 bg-brand-50 shadow-sm'
                                        : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50/50 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono font-bold text-surface-900">#{order.id}</span>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${order.priority === 'Alta' ? 'bg-red-100 text-red-700' : 'bg-surface-200 text-surface-600'}`}>
                                            {order.priority}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-surface-900 mb-1 line-clamp-1">{order.franchise}</div>
                                    <div className="flex justify-between items-center text-xs text-surface-500">
                                        <span>{order.items} itens</span>
                                        <span className={`font-medium ${order.status === 'Pago' ? 'text-green-600' : 'text-blue-600'}`}>{order.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Active Order Details */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm h-full flex flex-col">
                        {!activeOrder ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-10 text-surface-400">
                                <CheckCircle size={48} className="mb-4 text-surface-300" />
                                <h3 className="text-lg font-semibold text-surface-900">Nenhum Pedido</h3>
                                <p className="text-sm mt-1">Selecione um pedido na fila para processá-lo.</p>
                            </div>
                        ) : (
                            <>
                                <div className="p-6 border-b border-surface-200 flex justify-between items-center bg-surface-50/50 rounded-t-2xl">
                                    <div>
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-mono font-bold text-surface-900">#{activeOrder.id}</h2>
                                            <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-green-200">
                                                {activeOrder.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-surface-600 mt-1 font-medium">{activeOrder.franchise}</p>
                                        <p className="text-surface-400 text-sm">{activeOrder.date}</p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <button className="btn-secondary text-sm py-1.5 flex items-center gap-2">
                                            <FileText size={16} /> Ver NF
                                        </button>
                                        <div className="text-xs text-surface-500 bg-surface-100 px-2 py-1 rounded">{activeOrder.items} itens no total</div>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 overflow-y-auto">
                                    <div className="flex items-center gap-8 mb-8 relative">
                                        {/* Progress Line */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-surface-200 -z-10 -translate-y-1/2 rounded-full hidden sm:block">
                                            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: isSeparating ? '50%' : '15%' }}></div>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 bg-white px-2">
                                            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-500/30">
                                                <CheckCircle size={20} />
                                            </div>
                                            <span className="text-xs font-semibold text-green-700">Pago</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 bg-white px-2">
                                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isSeparating ? 'bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/30' : 'border-brand-500 bg-white text-brand-500 shadow-lg shadow-brand-500/10'}`}>
                                                <ClipboardList size={20} />
                                            </div>
                                            <span className="text-xs font-semibold text-brand-600">{isSeparating ? 'Separando' : 'A separar'}</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 bg-white px-2">
                                            <div className="w-10 h-10 rounded-full bg-surface-100 text-surface-400 flex items-center justify-center border-2 border-surface-200">
                                                <Package size={20} />
                                            </div>
                                            <span className="text-xs font-semibold text-surface-400">Embalado</span>
                                        </div>

                                        <div className="flex flex-col items-center gap-2 bg-white px-2">
                                            <div className="w-10 h-10 rounded-full bg-surface-100 text-surface-400 flex items-center justify-center border-2 border-surface-200">
                                                <Truck size={20} />
                                            </div>
                                            <span className="text-xs font-semibold text-surface-400">Enviado</span>
                                        </div>
                                    </div>

                                    <div className="border border-surface-200 rounded-xl overflow-hidden mb-6">
                                        <div className="bg-surface-50 px-4 py-3 font-semibold text-surface-900 border-b border-surface-200 flex justify-between">
                                            Resumo para Separação
                                            <span className="text-surface-500 text-sm font-normal">Checklist de caixas</span>
                                        </div>
                                        <div className="divide-y divide-surface-100">
                                            {activeOrder.orderItems.map((item: any, idx: number) => (
                                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-surface-50 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500 cursor-pointer" />
                                                        <div>
                                                            <div className="font-medium text-surface-900">{item.product_name}</div>
                                                            <div className="text-xs text-surface-500 font-mono">{item.product_sku}</div>
                                                        </div>
                                                    </div>
                                                    <div className="font-bold text-lg text-surface-900 bg-surface-100 px-3 py-1 rounded-lg">{item.quantity}x</div>
                                                </div>
                                            ))}
                                            {activeOrder.orderItems.length === 0 && (
                                                <div className="p-4 text-center text-surface-500 text-sm">Sem itens detalhados.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Frenet Integration Module */}
                                    <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 mb-6 relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 text-blue-100/50 opacity-40">
                                            <Truck size={100} />
                                        </div>
                                        <h3 className="font-semibold text-blue-900 mb-2 relative z-10 flex items-center gap-2">
                                            <Truck size={18} /> Integração Frenet
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                                            <div>
                                                <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Status da Etiqueta</label>
                                                <div className="text-sm bg-white border border-blue-200 px-3 py-2 rounded-lg text-surface-600 flex justify-between items-center">
                                                    {trackingCode ? 'Etiqueta Gerada' : (isGeneratingTag ? 'Gerando...' : 'Aguardando Separação')}
                                                    {!trackingCode && (
                                                        <button
                                                            onClick={() => {
                                                                setIsGeneratingTag(true);
                                                                setTimeout(() => {
                                                                    setIsGeneratingTag(false);
                                                                    setTrackingCode(`BR${activeOrder.id}BR`);
                                                                }, 1500);
                                                            }}
                                                            disabled={isGeneratingTag || !isSeparating}
                                                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors disabled:opacity-50 font-medium"
                                                        >
                                                            {isGeneratingTag ? <RefreshCw size={14} className="animate-spin" /> : 'Gerar'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">Cód. Rastreio</label>
                                                <input
                                                    type="text"
                                                    value={trackingCode}
                                                    onChange={(e) => setTrackingCode(e.target.value)}
                                                    placeholder="Aguardando geração..."
                                                    className="block w-full px-3 py-2 border border-blue-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm disabled:bg-surface-50"
                                                    disabled={!trackingCode && !isGeneratingTag}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border-t border-surface-200 bg-surface-50 rounded-b-2xl flex justify-between items-center mt-auto">
                                    <button
                                        onClick={() => setIsIssueModalOpen(true)}
                                        className="btn-secondary text-sm text-red-600 hover:bg-red-50 hover:border-red-200"
                                    >
                                        Problema
                                    </button>
                                    <button
                                        onClick={toggleSeparation}
                                        className={`btn-primary flex items-center gap-2 shadow-sm transition-colors ${isSeparating ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500/50 text-white border-transparent' : 'shadow-brand-500/20'}`}
                                    >
                                        {isSeparating ? (
                                            <>Finalizar Separação <CheckCircle size={16} /></>
                                        ) : (
                                            <>Iniciar Separação <ArrowRight size={16} /></>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Issue Modal */}
            <AnimatePresence>
                {isIssueModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsIssueModalOpen(false)}
                            className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10"
                        >
                            <div className="p-6 border-b border-surface-200 flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-surface-900 flex items-center gap-2">
                                    <AlertTriangle className="text-red-500" size={20} />
                                    Reportar Problema
                                </h3>
                                <button
                                    onClick={() => setIsIssueModalOpen(false)}
                                    className="p-2 text-surface-400 hover:bg-surface-200 hover:text-surface-700 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Tipo de Problema</label>
                                    <select className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                                        <option>Falta de Estoque Físico</option>
                                        <option>Produto Danificado</option>
                                        <option>Divergência de Informações</option>
                                        <option>Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-surface-700 mb-1">Descrição Detalhada</label>
                                    <textarea
                                        rows={4}
                                        placeholder="Descreva o problema encontrado com os itens deste pedido..."
                                        className="w-full bg-white border border-surface-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-500 resize-none"
                                    />
                                </div>
                            </div>
                            <div className="p-6 border-t border-surface-200 bg-surface-50 flex justify-end gap-3">
                                <button className="btn-secondary" onClick={() => setIsIssueModalOpen(false)}>Cancelar</button>
                                <button className="btn-primary bg-red-600 hover:bg-red-700 focus:ring-red-500/50" onClick={() => setIsIssueModalOpen(false)}>Enviar Reporte</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
