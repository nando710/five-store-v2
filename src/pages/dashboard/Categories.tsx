import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Check,
    Tags,
    CornerDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export function Categories() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryParent, setNewCategoryParent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            // Fetch categories and their nested product counts
            const { data, error } = await supabase
                .from('categories')
                .select('*, products(id)');

            if (error) throw error;

            const formattedCategories = data.map(cat => ({
                id: cat.id,
                name: cat.name,
                parent_id: cat.parent_id,
                status: 'Ativo', // Mock status as it's not in DB yet
                product_count: cat.products ? cat.products.length : 0
            }));

            setCategories(formattedCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        setIsSaving(true);
        try {
            const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const { error } = await supabase.from('categories').insert([{
                name: newCategoryName,
                slug: slug,
                parent_id: newCategoryParent || null,
            }]);

            if (error) throw error;
            setIsAddModalOpen(false);
            setNewCategoryName('');
            setNewCategoryParent('');
            fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
            alert('Erro ao criar categoria.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Erro ao excluir. Pode haver produtos vinculados.');
        }
    };

    // Helper to order categories hierarchically for the table
    const orderedCategories: any[] = [];
    const rootCategories = categories.filter(c => c.parent_id === null);

    rootCategories.forEach(root => {
        orderedCategories.push(root);
        const children = categories.filter(c => c.parent_id === root.id);
        children.forEach(child => {
            orderedCategories.push(child);
        });
    });

    const parentOptions = categories.filter(c => c.parent_id === null);

    return (
        <div className="space-y-6 pb-12">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-surface-900">Categorias</h1>
                    <p className="text-surface-500 text-sm mt-1">Organize seus produtos hierarquicamente para a vitrine.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]"
                >
                    <Plus size={18} />
                    Nova Categoria
                </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-surface-400 group-focus-within:text-brand-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl bg-surface-50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-sm text-surface-900"
                    />
                </div>
            </div>

            {/* Categories Table */}
            <div className="bg-white rounded-3xl border border-surface-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Nome da Categoria</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Qtd. Produtos</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100 text-surface-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-surface-500">
                                        Carregando categorias...
                                    </td>
                                </tr>
                            ) : orderedCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-surface-500">
                                        Nenhuma categoria encontrada.
                                    </td>
                                </tr>
                            ) : orderedCategories.map((category) => (
                                <tr key={category.id} className="hover:bg-surface-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {category.parent_id !== null && (
                                                <div className="pl-4 text-surface-300">
                                                    <CornerDownRight size={18} />
                                                </div>
                                            )}
                                            <div className="w-10 h-10 rounded-xl bg-surface-100 border border-surface-200 flex items-center justify-center text-surface-500 shadow-sm">
                                                <Tags size={18} />
                                            </div>
                                            <div className="font-semibold text-surface-900">
                                                {category.name}
                                                {category.parent_id === null && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-100 text-surface-500 uppercase tracking-widest">Pai</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
                                            ${category.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                            ${category.status === 'Inativo' ? 'bg-surface-100 text-surface-600 border-surface-200' : ''}
                                        `}>
                                            <span className={`w-1.5 h-1.5 rounded-full 
                                                ${category.status === 'Ativo' ? 'bg-emerald-500' : ''}
                                                ${category.status === 'Inativo' ? 'bg-surface-400' : ''}
                                            `}></span>
                                            {category.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-surface-500">
                                        {category.product_count} produtos
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 text-surface-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Editar">
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Category Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddModalOpen(false)}
                            className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col relative z-10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 bg-surface-50/50">
                                <h2 className="text-xl font-display font-semibold text-surface-900">Nova Categoria</h2>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-2 text-surface-400 hover:bg-surface-200 hover:text-surface-700 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 space-y-5 bg-white">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-surface-700">Nome da Categoria</label>
                                    <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Ex: Embalagens Premium" className="w-full bg-white border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-surface-700">Categoria Pai (Opcional)</label>
                                    <select value={newCategoryParent} onChange={(e) => setNewCategoryParent(e.target.value)} className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none">
                                        <option value="">Nenhuma (Categoria Principal)</option>
                                        {parentOptions.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-surface-500 mt-1">Selecione uma categoria existente para criar uma subcategoria.</p>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-surface-200 hover:border-brand-400 hover:bg-brand-50/50 transition-colors">
                                        <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" defaultChecked />
                                        <div>
                                            <span className="block text-sm font-semibold text-surface-900">Categoria Ativa</span>
                                            <span className="block text-xs text-surface-500 mt-0.5">Visível para os franqueados na loja.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t border-surface-200 bg-surface-50 flex justify-end gap-3">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-5 py-2.5 text-sm font-semibold text-surface-600 hover:text-surface-900 hover:bg-surface-200 rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button onClick={handleCreateCategory} disabled={isSaving} className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98]">
                                    <Check size={18} />
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
