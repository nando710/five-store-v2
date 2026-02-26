import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Image as ImageIcon,
    X,
    UploadCloud,
    Check,
    ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    prices: { tier1: number; tier2: number; tier3: number };
    stock: number;
    status: string;
}

export function Products() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [newForm, setNewForm] = useState({
        name: '', sku: '', category: '', description: '',
        price_tier1: '', price_tier2: '', price_tier3: '', stock: '0'
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(name)')
            .order('name');
        if (!error && data) {
            setProducts(data.map(p => ({
                id: p.id,
                name: p.name,
                sku: p.sku,
                // @ts-ignore
                category: p.categories?.name || '-',
                prices: { tier1: p.price_tier1, tier2: p.price_tier2, tier3: p.price_tier3 },
                stock: p.stock,
                status: p.status === 'active' ? 'Ativo' : p.status === 'low_stock' ? 'Estoque Baixo' : 'Inativo'
            })));
        }
        setIsLoading(false);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        await supabase.from('products').delete().eq('id', id);
        setProducts(prev => prev.filter(p => p.id !== id));
    };

    const handleEditClick = (product: Product) => {
        setEditingProductId(product.id);
        setNewForm({
            name: product.name,
            sku: product.sku,
            category: product.category,
            description: '', // We don't have description in the Product interface currently, but could fetch it if needed
            price_tier1: product.prices.tier1.toString(),
            price_tier2: product.prices.tier2.toString(),
            price_tier3: product.prices.tier3.toString(),
            stock: product.stock.toString()
        });
        setActiveTab('basic');
        setIsAddModalOpen(true);
    };

    const handleSaveProduct = async () => {
        const productData = {
            name: newForm.name,
            sku: newForm.sku,
            description: newForm.description,
            price_tier1: parseFloat(newForm.price_tier1) || 0,
            price_tier2: parseFloat(newForm.price_tier2) || 0,
            price_tier3: parseFloat(newForm.price_tier3) || 0,
            stock: parseInt(newForm.stock) || 0,
            status: 'active'
        };

        if (editingProductId) {
            const { error } = await supabase
                .from('products')
                .update(productData)
                .eq('id', editingProductId);

            if (!error) {
                setIsAddModalOpen(false);
                setEditingProductId(null);
                setNewForm({ name: '', sku: '', category: '', description: '', price_tier1: '', price_tier2: '', price_tier3: '', stock: '0' });
                fetchProducts();
            } else {
                alert('Erro ao atualizar produto: ' + error.message);
            }
        } else {
            const { error } = await supabase.from('products').insert([productData]);
            if (!error) {
                setIsAddModalOpen(false);
                setNewForm({ name: '', sku: '', category: '', description: '', price_tier1: '', price_tier2: '', price_tier3: '', stock: '0' });
                fetchProducts();
            } else {
                alert('Erro ao salvar produto: ' + error.message);
            }
        }
    };

    const closeAndResetModal = () => {
        setIsAddModalOpen(false);
        setEditingProductId(null);
        setNewForm({ name: '', sku: '', category: '', description: '', price_tier1: '', price_tier2: '', price_tier3: '', stock: '0' });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-surface-900">Catálogo de Produtos</h1>
                    <p className="text-surface-500 text-sm mt-1">Gerencie os insumos e visibilidade para os franqueados.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProductId(null);
                        setNewForm({ name: '', sku: '', category: '', description: '', price_tier1: '', price_tier2: '', price_tier3: '', stock: '0' });
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]"
                >
                    <Plus size={18} />
                    Novo Produto
                </button>
            </div>

            {/* Filters and Search - Premium styling */}
            <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400 group-focus-within:text-brand-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome, SKU ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl bg-surface-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-sm text-surface-900"
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-surface-200 bg-white hover:bg-surface-50 text-surface-700 rounded-xl transition-colors text-sm font-medium">
                        <Filter size={16} className="text-surface-500" />
                        <span>Filtros</span>
                    </button>

                    <div className="relative flex-1 sm:flex-none">
                        <select className="w-full appearance-none bg-white border border-surface-200 text-sm text-surface-700 rounded-xl pl-4 pr-10 py-2.5 outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all cursor-pointer">
                            <option>Todos os Status</option>
                            <option>Ativo</option>
                            <option>Inativo</option>
                            <option>Estoque Baixo</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-3xl border border-surface-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 w-16">Foto</th>
                                <th className="px-6 py-4">Produto</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Estoque</th>
                                <th className="px-6 py-4">Tabelas de Preços</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100 text-surface-700">
                            {isLoading ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-surface-500">Carregando produtos...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-12 text-center text-surface-500">Nenhum produto encontrado.</td></tr>
                            ) : filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-surface-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="w-12 h-12 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-400 shadow-sm">
                                            <ImageIcon size={20} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-surface-900 group-hover:text-brand-600 transition-colors cursor-pointer">
                                            {product.name}
                                        </div>
                                        <div className="text-xs text-surface-500 font-mono mt-0.5">{product.sku}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-surface-100 text-surface-600 border border-surface-200 text-xs font-medium">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-surface-900'}`}>
                                            {product.stock} un.
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <span className="text-surface-900 font-medium">Tb 1: R$ {product.prices.tier1.toFixed(2).replace('.', ',')}</span>
                                            <span className="text-surface-500">Tb 2: R$ {product.prices.tier2.toFixed(2).replace('.', ',')}</span>
                                            <span className="text-surface-500">Tb 3: R$ {product.prices.tier3.toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
                                            ${product.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                            ${product.status === 'Estoque Baixo' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                            ${product.status === 'Inativo' ? 'bg-surface-100 text-surface-600 border-surface-200' : ''}
                                        `}>
                                            <span className={`w-1.5 h-1.5 rounded-full 
                                                ${product.status === 'Ativo' ? 'bg-emerald-500' : ''}
                                                ${product.status === 'Estoque Baixo' ? 'bg-amber-500' : ''}
                                                ${product.status === 'Inativo' ? 'bg-surface-400' : ''}
                                            `}></span>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditClick(product)} className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Editar">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="w-px h-4 bg-surface-200 mx-1"></div>
                                            <button className="p-2 text-surface-400 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-surface-200 flex items-center justify-between text-sm text-surface-500 bg-surface-50">
                    <span>Mostrando <span className="font-medium text-surface-900">1</span> a <span className="font-medium text-surface-900">5</span> de <span className="font-medium text-surface-900">42</span> resultados</span>
                    <div className="flex gap-1.5">
                        <button className="px-3 py-1.5 rounded-lg border border-surface-200 disabled:opacity-50 hover:bg-white text-surface-700 font-medium transition-colors">Anterior</button>
                        <button className="px-3 py-1.5 rounded-lg bg-brand-600 text-white font-medium shadow-sm shadow-brand-500/20">1</button>
                        <button className="px-3 py-1.5 rounded-lg border border-surface-200 hover:bg-white text-surface-700 font-medium transition-colors">2</button>
                        <button className="px-3 py-1.5 rounded-lg border border-surface-200 hover:bg-white text-surface-700 font-medium transition-colors">3</button>
                        <button className="px-3 py-1.5 rounded-lg border border-surface-200 hover:bg-white text-surface-700 font-medium transition-colors">Próxima</button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Product Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeAndResetModal}
                            className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-50/50">
                                <h2 className="text-xl font-display font-semibold text-surface-900">
                                    {editingProductId ? 'Editar Insumo' : 'Cadastrar Insumo'}
                                </h2>
                                <button
                                    onClick={closeAndResetModal}
                                    className="p-2 text-surface-400 hover:bg-surface-200 hover:text-surface-700 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex px-6 border-b border-surface-200 bg-white">
                                <button
                                    onClick={() => setActiveTab('basic')}
                                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'basic' ? 'border-brand-500 text-brand-600' : 'border-transparent text-surface-500 hover:text-surface-900'}`}
                                >
                                    Dados Básicos
                                </button>
                                <button
                                    onClick={() => setActiveTab('logistics')}
                                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'logistics' ? 'border-brand-500 text-brand-600' : 'border-transparent text-surface-500 hover:text-surface-900'}`}
                                >
                                    Logística & Estoque
                                </button>
                                <button
                                    onClick={() => setActiveTab('fiscal')}
                                    className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'fiscal' ? 'border-brand-500 text-brand-600' : 'border-transparent text-surface-500 hover:text-surface-900'}`}
                                >
                                    Dados Fiscais
                                </button>
                            </div>

                            {/* Body */}
                            <div className="flex-1 overflow-y-auto p-6 bg-surface-50">
                                {activeTab === 'basic' && (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="md:col-span-2 space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-surface-700">Nome do Produto</label>
                                                <input type="text" value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} placeholder="Ex: Copo Descartável 500ml" className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">SKU (Código)</label>
                                                    <input type="text" value={newForm.sku} onChange={e => setNewForm({ ...newForm, sku: e.target.value })} placeholder="EX: EMB-001" className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 font-mono text-sm text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Categoria Pai</label>
                                                    <select className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none">
                                                        <option>Selecione...</option>
                                                        <option>Embalagens</option>
                                                        <option>Insumos</option>
                                                        <option>Uniformes</option>
                                                        <option>Marketing</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Subcategoria (Opcional)</label>
                                                    <select className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none">
                                                        <option>Selecione o Pai primeiro...</option>
                                                        <option>Copos Descartáveis</option>
                                                        <option>Sacolas Kraft</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-sm font-semibold text-surface-700">Descrição Completa</label>
                                                <textarea rows={4} value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} className="w-full bg-white border border-surface-200 rounded-xl px-4 py-3 text-sm text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none resize-none" placeholder="Detalhes do insumo..."></textarea>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Preço Tabela 1 (Base)</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-500 text-sm">R$</span>
                                                        <input type="text" value={newForm.price_tier1} onChange={e => setNewForm({ ...newForm, price_tier1: e.target.value })} placeholder="0.00" className="w-full bg-white border border-surface-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Preço Tabela 2</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-500 text-sm">R$</span>
                                                        <input type="text" value={newForm.price_tier2} onChange={e => setNewForm({ ...newForm, price_tier2: e.target.value })} placeholder="0.00" className="w-full bg-white border border-surface-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Preço Tabela 3</label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-500 text-sm">R$</span>
                                                        <input type="text" value={newForm.price_tier3} onChange={e => setNewForm({ ...newForm, price_tier3: e.target.value })} placeholder="0.00" className="w-full bg-white border border-surface-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <div className="space-y-1.5 flex flex-col justify-end">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" defaultChecked />
                                                        <span className="text-sm font-medium text-surface-700">Produto Ativo na Vitrine</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-surface-700">Imagem Principal</label>
                                            <div className="w-full aspect-square bg-white border-2 border-dashed border-surface-200 hover:border-brand-400 rounded-2xl flex flex-col items-center justify-center text-surface-400 hover:text-brand-500 transition-colors cursor-pointer group">
                                                <div className="w-12 h-12 rounded-full bg-surface-100 group-hover:bg-brand-50 flex items-center justify-center mb-3 transition-colors">
                                                    <UploadCloud size={24} />
                                                </div>
                                                <span className="text-sm font-medium text-center px-4">Clique ou arraste a imagem aqui</span>
                                                <span className="text-xs text-surface-400 mt-1">PNG, JPG até 2MB</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'logistics' && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-5 rounded-2xl border border-surface-200">
                                            <h3 className="text-sm font-bold text-surface-900 mb-4 flex items-center gap-2">
                                                Controle de Estoque
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Quantidade Atual</label>
                                                    <input type="number" value={newForm.stock} onChange={e => setNewForm({ ...newForm, stock: e.target.value })} placeholder="0" className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Estoque Mínimo (Alerta)</label>
                                                    <input type="number" placeholder="10" className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-5 rounded-2xl border border-surface-200">
                                            <h3 className="text-sm font-bold text-surface-900 mb-4">Dimensões p/ Cálculo de Frete (Frenet)</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Peso (kg)</label>
                                                    <input type="text" placeholder="0.5" className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Altura (cm)</label>
                                                    <input type="text" placeholder="10" className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Largura (cm)</label>
                                                    <input type="text" placeholder="20" className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Compr. (cm)</label>
                                                    <input type="text" placeholder="20" className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 transition-all outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'fiscal' && (
                                    <div className="space-y-6">
                                        <div className="bg-white p-5 rounded-2xl border border-surface-200">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">NCM</label>
                                                    <input type="text" placeholder="0000.00.00" className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 font-mono text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">CEST</label>
                                                    <input type="text" placeholder="00.000.00" className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 font-mono text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-sm font-semibold text-surface-700">Origem da Mercadoria</label>
                                                    <select className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none">
                                                        <option>0 - Nacional</option>
                                                        <option>1 - Estrangeira (Importação direta)</option>
                                                        <option>2 - Estrangeira (Mercado interno)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-surface-200 bg-white flex justify-end gap-3">
                                <button
                                    onClick={closeAndResetModal}
                                    className="px-5 py-2.5 text-sm font-semibold text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button onClick={handleSaveProduct} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]">
                                    <Check size={18} />
                                    Salvar Produto
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
