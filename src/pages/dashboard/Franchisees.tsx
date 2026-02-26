import { useState, useEffect } from 'react';
import {
    Search,
    MoreVertical,
    CheckCircle,
    XCircle,
    Clock,
    Store,
    MapPin,
    Mail,
    FileText,
    Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

type FranchiseeStatus = 'active' | 'pending' | 'suspended';

interface Franchisee {
    id: string;
    storeName: string;
    ownerName: string;
    email: string;
    phone: string;
    status: FranchiseeStatus;
    requestedAt: string;
    location: string;
    cnpj: string;
    tier: 1 | 2 | 3;
}


export function Franchisees() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | FranchiseeStatus>('all');
    const [selectedFranchisee, setSelectedFranchisee] = useState<Franchisee | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [franchisees, setFranchisees] = useState<Franchisee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFranchisees = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'store')
                .order('created_at', { ascending: false });

            if (!error && data) {
                setFranchisees(data.map(f => ({
                    id: f.id,
                    storeName: f.store_name || f.name,
                    ownerName: f.name,
                    email: f.email,
                    phone: f.phone || '-',
                    status: f.status as FranchiseeStatus,
                    requestedAt: f.created_at.slice(0, 10),
                    location: f.location || '-',
                    cnpj: f.cnpj || '-',
                    tier: (f.tier || 1) as 1 | 2 | 3
                })));
            }
            setIsLoading(false);
        };

        fetchFranchisees();
    }, []);

    const filteredFranchisees = franchisees.filter(f => {
        const matchesSearch = f.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: FranchiseeStatus) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'suspended':
                return 'bg-red-100 text-red-700 border-red-200';
        }
    };

    const getStatusText = (status: FranchiseeStatus) => {
        switch (status) {
            case 'active': return 'Ativo';
            case 'pending': return 'Aguardando Aprovação';
            case 'suspended': return 'Suspenso';
        }
    };

    const handleAction = (franchisee: Franchisee) => {
        setSelectedFranchisee(franchisee);
        setIsModalOpen(true);
    };

    const updateStatus = async (id: string, newStatus: FranchiseeStatus) => {
        const { error } = await supabase
            .from('profiles')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar status: ' + error.message);
            return;
        }

        // Update local state
        setFranchisees(prev =>
            prev.map(f => f.id === id ? { ...f, status: newStatus } : f)
        );
        if (selectedFranchisee?.id === id) {
            setSelectedFranchisee(prev => prev ? { ...prev, status: newStatus } : null);
        }
        setIsModalOpen(false);
    };

    const updateTier = async (id: string, newTier: 1 | 2 | 3) => {
        const { error } = await supabase
            .from('profiles')
            .update({ tier: newTier })
            .eq('id', id);

        if (error) {
            alert('Erro ao atualizar tabela de preços: ' + error.message);
            return;
        }

        // Update local state
        setFranchisees(prev =>
            prev.map(f => f.id === id ? { ...f, tier: newTier } : f)
        );
        if (selectedFranchisee?.id === id) {
            setSelectedFranchisee(prev => prev ? { ...prev, tier: newTier } : null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-display font-semibold text-surface-900">Gestão de Franqueados</h1>
                    <p className="text-sm text-surface-500 mt-1">Aprove novos cadastros e gerencie as unidades da rede.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="bg-white border border-surface-200 rounded-xl px-4 py-2 flex items-center gap-3">
                        <span className="text-xs font-semibold text-surface-500 uppercase">Total:</span>
                        <span className="text-sm font-bold text-surface-900">{franchisees.length} unidades</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-surface-200 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome da loja ou proprietário..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    {(['all', 'pending', 'active', 'suspended'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px - 4 py - 2 rounded - xl text - sm font - medium transition - colors border ${statusFilter === status
                                ? 'bg-brand-50 border-brand-200 text-brand-700'
                                : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                                } `}
                        >
                            {status === 'all' ? 'Todos' : getStatusText(status)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-surface-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-50 border-b border-surface-200">
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Unidade / Proprietário</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Contato / Localização</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Solicitado em</th>
                                <th className="px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-200">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-surface-500">Carregando franqueados...</td></tr>
                            ) : filteredFranchisees.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-surface-500">Nenhum franqueado encontrado.</td></tr>
                            ) : filteredFranchisees.map((franchisee) => (
                                <tr key={franchisee.id} className={`hover: bg - surface - 50 transition - colors ${franchisee.status === 'pending' ? 'bg-yellow-50/30' : ''} `}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors flex items-center gap-2">
                                                <Store size={14} className="text-surface-400" />
                                                {franchisee.storeName}
                                            </span>
                                            <span className="text-sm text-surface-500">{franchisee.ownerName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-sm text-surface-600">
                                            <span className="flex items-center gap-2"><MapPin size={12} /> {franchisee.location}</span>
                                            <span className="flex items-center gap-2"><Mail size={12} /> {franchisee.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline - flex items - center px - 2.5 py - 1 rounded - full text - xs font - medium border ${getStatusStyle(franchisee.status)} `}>
                                            {franchisee.status === 'pending' && <Clock size={12} className="mr-1.5" />}
                                            {getStatusText(franchisee.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-surface-600">
                                        {new Date(franchisee.requestedAt).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleAction(franchisee)}
                                            className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                            title="Ver detalhes"
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredFranchisees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-surface-500">
                                        Nenhum franqueado encontrado com os filtros atuais.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Franchisee Details / Approval Modal */}
            <AnimatePresence>
                {isModalOpen && selectedFranchisee && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-surface-200 flex justify-between items-center bg-surface-50">
                                <div>
                                    <h3 className="text-xl font-display font-semibold text-surface-900 flex items-center gap-2">
                                        <Store className="text-brand-500" size={24} />
                                        {selectedFranchisee.storeName}
                                    </h3>
                                    <p className="text-sm text-surface-500 mt-1">Detalhes do Cadastro</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-surface-400 hover:bg-surface-200 hover:text-surface-700 rounded-full transition-colors"
                                >
                                    <XCircle size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Company Info */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-surface-900 uppercase tracking-wider">
                                            <FileText size={16} className="text-brand-500" />
                                            Dados da Empresa
                                        </h4>
                                        <div className="bg-surface-50 rounded-xl p-4 space-y-3">
                                            <div>
                                                <span className="block text-xs text-surface-500">Nome da Unidade</span>
                                                <span className="font-medium text-surface-900">{selectedFranchisee.storeName}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-surface-500">CNPJ</span>
                                                <span className="font-medium text-surface-900">{selectedFranchisee.cnpj}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-surface-500">Localização</span>
                                                <span className="font-medium text-surface-900">{selectedFranchisee.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-4">
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-surface-900 uppercase tracking-wider">
                                            <Users size={16} className="text-blue-500" />
                                            Dados de Contato
                                        </h4>
                                        <div className="bg-surface-50 rounded-xl p-4 space-y-3">
                                            <div>
                                                <span className="block text-xs text-surface-500">Nome do Responsável</span>
                                                <span className="font-medium text-surface-900">{selectedFranchisee.ownerName}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-surface-500">E-mail</span>
                                                <span className="font-medium text-surface-900">{selectedFranchisee.email}</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-surface-500">Telefone</span>
                                                <span className="font-medium text-surface-900">{selectedFranchisee.phone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Settings */}
                                    <div className="md:col-span-2 space-y-4">
                                        <h4 className="flex items-center gap-2 text-sm font-semibold text-surface-900 uppercase tracking-wider mt-2">
                                            <Store size={16} className="text-emerald-500" />
                                            Configurações Operacionais
                                        </h4>
                                        <div className="bg-surface-50 rounded-xl p-4 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                                            <div>
                                                <span className="block text-sm font-medium text-surface-900 mb-1">Tabela de Preços (Tier)</span>
                                                <span className="text-xs text-surface-500 max-w-xs">Define a tabela de preços padrão (desconto) que o franqueado acessa no seu painel. O franqueado não vê que está em um Tier.</span>
                                            </div>

                                            <div className="flex bg-white border border-surface-200 rounded-lg p-1 w-full md:w-auto">
                                                <button
                                                    onClick={() => updateTier(selectedFranchisee.id, 1)}
                                                    className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedFranchisee.tier === 1 ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-surface-600 hover:bg-surface-50'}`}
                                                >
                                                    Tabela 1
                                                </button>
                                                <button
                                                    onClick={() => updateTier(selectedFranchisee.id, 2)}
                                                    className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedFranchisee.tier === 2 ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-surface-600 hover:bg-surface-50'}`}
                                                >
                                                    Tabela 2
                                                </button>
                                                <button
                                                    onClick={() => updateTier(selectedFranchisee.id, 3)}
                                                    className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedFranchisee.tier === 3 ? 'bg-brand-50 text-brand-700 shadow-sm' : 'text-surface-600 hover:bg-surface-50'}`}
                                                >
                                                    Tabela 3
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface-100 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-surface-600 font-medium">Status Atual do Cadastro:</span>
                                        <span className={`inline - flex items - center px - 3 py - 1 rounded - full text - xs font - bold border uppercase tracking - wide ${getStatusStyle(selectedFranchisee.status)} `}>
                                            {getStatusText(selectedFranchisee.status)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-surface-400">
                                        Solicitado em {new Date(selectedFranchisee.requestedAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 border-t border-surface-200 bg-surface-50 flex flex-col sm:flex-row justify-end gap-3">
                                {selectedFranchisee.status === 'pending' ? (
                                    <>
                                        <button
                                            className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200"
                                            onClick={() => updateStatus(selectedFranchisee.id, 'suspended')}
                                        >
                                            Rejeitar Solicitação
                                        </button>
                                        <button
                                            className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500/50 flex items-center gap-2"
                                            onClick={() => updateStatus(selectedFranchisee.id, 'active')}
                                        >
                                            <CheckCircle size={18} /> Aprovar Franqueado
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {selectedFranchisee.status === 'active' && (
                                            <button
                                                className="btn-secondary text-red-600 hover:bg-red-50 hover:border-red-200 flex items-center gap-2"
                                                onClick={() => updateStatus(selectedFranchisee.id, 'suspended')}
                                            >
                                                Suspender Unidade
                                            </button>
                                        )}
                                        {selectedFranchisee.status === 'suspended' && (
                                            <button
                                                className="btn-secondary text-green-600 hover:bg-green-50 hover:border-green-200 flex items-center gap-2"
                                                onClick={() => updateStatus(selectedFranchisee.id, 'active')}
                                            >
                                                Reativar Unidade
                                            </button>
                                        )}
                                        <button className="btn-primary" onClick={() => setIsModalOpen(false)}>
                                            Fechar
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
