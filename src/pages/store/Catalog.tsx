import { useState, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Star, ChevronDown, ChevronRight, Minus, Plus, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { FranchiseeTier } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';

interface Category {
    id: string;
    name: string;
    subcategories?: { id: string, name: string }[];
}

interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    subcategory: string | null;
    prices: { tier1: number, tier2: number, tier3: number };
    imgColor: string;
    packSize: string;
    isNew?: boolean;
    isPopular?: boolean;
}

export function Catalog() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addItem } = useCart();
    const currentTier: FranchiseeTier = user?.tier || 1;

    const [activeCategory, setActiveCategory] = useState<string | null>('Todos');
    const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});
    const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

    const [categories, setCategories] = useState<Category[]>([{ id: 'todos', name: 'Todos' }]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCatalog = async () => {
            setIsLoading(true);
            try {
                // Fetch categories
                const { data: catData, error: catError } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');
                if (catError) throw catError;

                // Build category tree
                const mainCats = catData.filter(c => !c.parent_id).map(c => ({
                    id: c.slug,
                    name: c.name,
                    subcategories: catData
                        .filter(sub => sub.parent_id === c.id)
                        .map(sub => ({ id: sub.slug, name: sub.name }))
                }));
                setCategories([{ id: 'todos', name: 'Todos' }, ...mainCats]);

                // Fetch products
                const { data: prodData, error: prodError } = await supabase
                    .from('products')
                    .select(`
                        *,
                        category:categories(name, parent_id)
                    `)
                    .eq('status', 'active');

                if (prodError) throw prodError;

                const formattedProd = prodData.map(p => {
                    let catName = '';
                    let subName = null;

                    if (p.category) {
                        // @ts-ignore (Supabase nested join types)
                        if (p.category.parent_id) {
                            // @ts-ignore
                            subName = p.category.name;
                            // @ts-ignore
                            const parent = catData.find(c => c.id === p.category.parent_id);
                            if (parent) catName = parent.name;
                        } else {
                            // @ts-ignore
                            catName = p.category.name;
                        }
                    }

                    return {
                        id: p.id,
                        name: p.name,
                        sku: p.sku,
                        category: catName,
                        subcategory: subName,
                        prices: { tier1: p.price_tier1, tier2: p.price_tier2, tier3: p.price_tier3 },
                        imgColor: p.img_url || 'bg-brand-50',
                        packSize: p.pack_size || '1 Unidade',
                        // Optional enhancements
                        isNew: new Date(p.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000,
                        isPopular: false
                    };
                });

                setProducts(formattedProd);
            } catch (err) {
                console.error("Error fetching catalog", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCatalog();
    }, []);

    const toggleCategoryExpansion = (categoryName: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    const handleCategoryClick = (categoryName: string, hasSubcategories: boolean) => {
        if (categoryName === 'Todos') {
            setActiveCategory('Todos');
            setActiveSubcategory(null);
            setExpandedCategories([]);
            return;
        }

        if (hasSubcategories) {
            toggleCategoryExpansion(categoryName);
            // Optionally clear subcategory when clicking main category to see all inside it
            setActiveCategory(categoryName);
            setActiveSubcategory(null);
        } else {
            setActiveCategory(categoryName);
            setActiveSubcategory(null);
        }
    };

    const handleSubcategoryClick = (categoryName: string, subcategoryName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveCategory(categoryName);
        setActiveSubcategory(subcategoryName);
    };

    const handleUpdateQuantity = (id: string, delta: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(1, (prev[id] || 1) + delta)
        }));
    };

    // Filter Logic
    const filteredProducts = products.filter(p => {
        if (activeCategory === 'Todos') return true;
        if (activeSubcategory) {
            return p.category === activeCategory && p.subcategory === activeSubcategory;
        }
        return p.category === activeCategory;
    });

    const getPageTitle = () => {
        if (activeCategory === 'Todos') return 'Catálogo Completo';
        if (activeSubcategory) return `${activeSubcategory}`;
        return activeCategory;
    };

    // Framer Motion Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 size={40} className="text-brand-500 animate-spin" />
                <p className="text-surface-500 font-medium animate-pulse">Carregando catálogo completo...</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Hero Banner */}
            <div className="bg-surface-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-[50%] h-full bg-brand-500/20 blur-[100px] pointer-events-none rounded-full transform translate-x-1/2" />
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-brand-500/20 text-brand-400 text-xs font-bold tracking-wider uppercase rounded-full mb-4 border border-brand-500/30">
                        Nova Coleção
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-white leading-tight mb-4">
                        Suprimentos de Inverno
                    </h1>
                    <p className="text-surface-300 text-lg mb-8 max-w-lg">
                        Garanta o estoque de caldos, chocolates e embalagens térmicas para a estação mais fria do ano.
                    </p>
                    <button className="bg-brand-500 hover:bg-brand-400 text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-lg shadow-brand-500/25">
                        Ver Destaques
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters - Updated with Subcategories */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-6">
                    <div className="bg-white rounded-2xl border border-surface-200 p-4 shadow-sm sticky top-24">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-500 mb-4 px-2">Navegue por Categoria</h3>
                        <ul className="space-y-1">
                            {categories.map(cat => {
                                const isExpanded = expandedCategories.includes(cat.name);
                                const isMainActive = activeCategory === cat.name;
                                const hasSubs = !!cat.subcategories && cat.subcategories.length > 0;

                                return (
                                    <li key={cat.id} className="flex flex-col">
                                        <button
                                            onClick={() => handleCategoryClick(cat.name, hasSubs)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all
                                                ${isMainActive && !activeSubcategory
                                                    ? 'bg-brand-50 text-brand-700 font-bold'
                                                    : 'text-surface-700 hover:bg-surface-50 hover:text-surface-900 font-medium'
                                                }`}
                                        >
                                            <span className="truncate">{cat.name}</span>
                                            {hasSubs && (
                                                <span className={`text-surface-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <ChevronDown size={16} />
                                                </span>
                                            )}
                                        </button>

                                        {/* Subcategories */}
                                        <AnimatePresence>
                                            {hasSubs && isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden mt-1"
                                                >
                                                    <ul className="pl-3 relative before:content-[''] before:absolute before:left-[18px] before:top-0 before:bottom-2 before:w-px before:bg-surface-200 space-y-1">
                                                        {cat.subcategories!.map((sub: { id: string, name: string }) => {
                                                            const isSubActive = isMainActive && activeSubcategory === sub.name;
                                                            return (
                                                                <li key={sub.id} className="relative z-10 pl-6">
                                                                    {/* Connector line graphic */}
                                                                    <div className="absolute left-[5px] top-1/2 -translate-y-1/2 w-3 h-px bg-surface-200 pointer-events-none" />

                                                                    <button
                                                                        onClick={(e) => handleSubcategoryClick(cat.name, sub.name, e)}
                                                                        className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors relative
                                                                            ${isSubActive
                                                                                ? 'text-brand-600 font-semibold bg-brand-50/50'
                                                                                : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
                                                                            }`}
                                                                    >
                                                                        {sub.name}
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* Product Grid Area */}
                <div className="flex-1 space-y-6">

                    {/* Top Bar: Search & Sort */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-display font-semibold text-surface-900 flex items-center gap-2">
                                {getPageTitle()}
                                <span className="inline-flex items-center justify-center bg-surface-100 text-surface-500 text-xs font-medium rounded-full h-6 px-2.5">
                                    {filteredProducts.length} itens
                                </span>
                            </h2>
                            {activeSubcategory && (
                                <p className="text-sm text-surface-500 flex items-center gap-1 mt-1">
                                    <span className="hover:text-brand-600 cursor-pointer transition-colors" onClick={() => handleCategoryClick(activeCategory!, true)}>
                                        {activeCategory}
                                    </span>
                                    <ChevronRight size={14} />
                                    <span className="text-surface-900">{activeSubcategory}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                    <Search size={16} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Buscar produto..."
                                    className="block w-full pl-9 pr-3 py-2 border border-surface-200 rounded-lg bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-sm shadow-sm"
                                />
                            </div>
                            <button className="p-2 border border-surface-200 bg-white rounded-lg text-surface-500 hover:bg-surface-50 transition-colors sm:hidden shadow-sm">
                                <Filter size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    {filteredProducts.length > 0 ? (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            key={(activeCategory || '') + (activeSubcategory || '')} // Re-trigger animation on category change
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {filteredProducts.map(product => (
                                <motion.div
                                    variants={itemVariants}
                                    layout
                                    key={product.id}
                                    onClick={() => navigate(`/store/product/${product.id}`)}
                                    className="group bg-white rounded-2xl overflow-hidden border border-surface-200 hover:border-brand-300 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 cursor-pointer flex flex-col h-full"
                                >
                                    {/* Image Placeholder */}
                                    <div className={`aspect-square w-full relative ${product.imgColor} flex items-center justify-center p-6 bg-opacity-30 group-hover:bg-opacity-40 transition-all`}>

                                        {/* Tags */}
                                        <div className="absolute top-3 inset-x-3 flex justify-between pr-3 z-10">
                                            {product.isNew ? (
                                                <span className="bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-md">
                                                    Novo
                                                </span>
                                            ) : product.isPopular ? (
                                                <span className="bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                                                    <Star size={10} fill="currentColor" /> Popular
                                                </span>
                                            ) : (
                                                <span /> // empty placeholder for space-between flex
                                            )}
                                        </div>

                                        {/* Generic icon since we don't have images */}
                                        <div className="text-surface-900/10 group-hover:text-brand-600/20 group-hover:scale-110 transition-all duration-500">
                                            <span className="text-6xl font-display font-black">F</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="text-xs font-mono text-surface-400 mb-1 flex items-center justify-between">
                                            <span>{product.sku}</span>
                                        </div>
                                        <h3 className="font-medium text-surface-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <div className="text-xs text-surface-500 mb-4">{product.packSize}</div>

                                        <div className="mt-auto flex flex-col gap-3 pt-3 border-t border-surface-100">
                                            {/* Price Row */}
                                            <div>
                                                <span className="text-xl font-bold text-surface-900 block leading-none">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.prices[`tier${currentTier}` as keyof typeof product.prices] || product.prices.tier1)}
                                                </span>
                                            </div>

                                            {/* Quantity and Add to Cart Row */}
                                            <div className="flex items-center gap-2 w-full">
                                                {/* Quantity Selector */}
                                                <div className="flex-1 flex items-center justify-between bg-white border border-surface-200 rounded-xl p-1 h-11" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => handleUpdateQuantity(product.id, -1, e)}
                                                        className="w-8 h-8 flex items-center justify-center text-surface-500 hover:bg-surface-100 rounded-lg transition-colors"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="font-semibold text-surface-900 text-sm">
                                                        {quantities[product.id] || 1}
                                                    </span>
                                                    <button
                                                        onClick={(e) => handleUpdateQuantity(product.id, 1, e)}
                                                        className="w-8 h-8 flex items-center justify-center text-surface-500 hover:bg-surface-100 rounded-lg transition-colors"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>

                                                {/* Cart Button */}
                                                <button
                                                    className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 ${addedToCart[product.id]
                                                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                                        : 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20'
                                                        }`}
                                                    title="Adicionar ao Carrinho"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const tierPrice = product.prices[`tier${currentTier}` as keyof typeof product.prices] || product.prices.tier1;
                                                        addItem(
                                                            {
                                                                id: product.id,
                                                                name: product.name,
                                                                sku: product.sku,
                                                                price: tierPrice,
                                                                imgColor: product.imgColor,
                                                                packSize: product.packSize,
                                                            },
                                                            quantities[product.id] || 1
                                                        );
                                                        // Visual feedback
                                                        setAddedToCart(prev => ({ ...prev, [product.id]: true }));
                                                        setTimeout(() => {
                                                            setAddedToCart(prev => ({ ...prev, [product.id]: false }));
                                                        }, 2000);
                                                    }}
                                                >
                                                    {addedToCart[product.id] ? <Check size={18} /> : <ShoppingCart size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="bg-white border text-center border-surface-200 rounded-2xl p-12 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-surface-100 text-surface-400 rounded-full flex items-center justify-center mb-4">
                                <Search size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-surface-900 mb-2">Nenhum produto encontrado</h3>
                            <p className="text-surface-500 max-w-sm">
                                Não encontramos produtos na categoria <span className="font-semibold text-surface-700">{activeSubcategory || activeCategory}</span>.
                            </p>
                            <button
                                onClick={() => handleCategoryClick('Todos', false)}
                                className="mt-6 btn-secondary"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </motion.div>
    );
}
