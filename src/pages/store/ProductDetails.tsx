import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ShoppingCart,
    Package,
    Truck,
    ShieldCheck,
    Star,
    Minus,
    Plus,
    CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { FranchiseeTier } from '../../contexts/AuthContext';

export function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentTier: FranchiseeTier = user?.tier || 1;
    const [quantity, setQuantity] = useState(1);
    const [cep, setCep] = useState('');
    const [shippingResult, setShippingResult] = useState<{ name: string, price: number, days: number } | null>(null);

    // Mock product data based on ID
    const product = {
        id: id || '1',
        sku: 'EMB-001',
        name: 'Copo Descartável Biodegradável 500ml',
        prices: { tier1: 45.90, tier2: 41.50, tier3: 39.00 },
        oldPrice: 55.90,
        category: 'Embalagens',
        description: 'Copos descartáveis de alta resistência, ideais para bebidas frias e quentes. Fabricados com material 100% biodegradável, alinhados com as práticas ESG da sua franquia.',
        specifications: [
            { label: 'Capacidade', value: '500ml' },
            { label: 'Material', value: 'Papel Kraft Biodegradável' },
            { label: 'Unidades por pacote', value: '100 unidades' },
            { label: 'Temperatura Suportada', value: 'Até 90°C' },
        ],
        inStock: true,
        stockQuantity: 154,
        rating: 4.8,
        reviews: 12,
        images: ['bg-emerald-100', 'bg-emerald-200', 'bg-emerald-300'], // Mock image colors
        isNew: true
    };

    const currentImage = product.images[0];

    const handleUpdateQuantity = (delta: number) => {
        setQuantity(Math.max(1, quantity + delta));
    };

    const handleCalculateShipping = () => {
        if (cep.length >= 8) {
            setShippingResult({ name: 'Correios SEDEX', price: 25.50, days: 3 });
        }
    };

    const handleAddToCart = () => {
        // In a real app, dispatch to Redux/Context
        navigate('/store/cart');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Breadcrumb & Back */}
            <div className="flex items-center gap-4 text-sm">
                <button
                    onClick={() => navigate('/store')}
                    className="text-surface-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Voltar ao Catálogo
                </button>
                <span className="text-surface-300">/</span>
                <span className="text-surface-500">{product.category}</span>
                <span className="text-surface-300">/</span>
                <span className="text-brand-600 font-medium truncate max-w-xs">{product.name}</span>
            </div>

            <div className="bg-white rounded-3xl border border-surface-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-surface-200">

                    {/* Left Column: Images */}
                    <div className="p-8 space-y-4">
                        {/* Main Image Mock */}
                        <div className={`w-full aspect-square rounded-2xl ${currentImage} flex items-center justify-center relative`}>
                            {product.isNew && (
                                <span className="absolute top-4 left-4 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Novo
                                </span>
                            )}
                            <span className="text-9xl font-display font-black text-surface-900/10">F</span>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={`w-20 h-20 rounded-xl ${img} flex items-center justify-center border-2 transition-all 
                  ${idx === 0 ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-transparent hover:border-brand-300'}`}
                                >
                                    <span className="text-2xl font-display font-black text-surface-900/10">F</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Details & Actions */}
                    <div className="p-8 flex flex-col justify-between">
                        <div className="space-y-6">
                            {/* Header Info */}
                            <div>
                                <p className="text-sm font-mono text-surface-500 mb-2">SKU: {product.sku}</p>
                                <h1 className="text-3xl font-display font-bold text-surface-900 leading-tight mb-3">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center text-amber-500">
                                        <Star size={16} className="fill-current" />
                                        <span className="font-medium ml-1">{product.rating}</span>
                                    </div>
                                    <span className="text-surface-400">({product.reviews} avaliações)</span>
                                    <span className="text-surface-300">|</span>
                                    {product.inStock ? (
                                        <span className="text-green-600 font-medium flex items-center gap-1">
                                            <CheckCircle size={14} /> Em Estoque ({product.stockQuantity})
                                        </span>
                                    ) : (
                                        <span className="text-red-500 font-medium">Fora de Estoque</span>
                                    )}
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="bg-surface-50 p-6 rounded-2xl border border-surface-100">
                                {product.oldPrice && (
                                    <p className="text-surface-400 line-through text-lg">
                                        R$ {product.oldPrice.toFixed(2).replace('.', ',')}
                                    </p>
                                )}
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-display font-bold text-brand-600">
                                        R$ {product.prices[`tier${currentTier}` as keyof typeof product.prices].toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="text-surface-500 mb-1">/ pct</span>
                                </div>
                                <p className="text-xs text-surface-500 mx-1 mt-2 flex items-center gap-1">
                                    <ShieldCheck size={14} className="text-green-500" />
                                    Preço exclusivo para franqueados Five
                                </p>
                            </div>

                            {/* Add to Cart Actions */}
                            <div className="space-y-4 pt-2">
                                <div className="flex gap-4">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center bg-white border border-surface-200 rounded-xl p-1 h-12">
                                        <button
                                            onClick={() => handleUpdateQuantity(-1)}
                                            className="w-10 h-10 flex items-center justify-center text-surface-500 hover:bg-surface-100 rounded-lg transition-colors"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <span className="w-12 text-center font-medium text-surface-900">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => handleUpdateQuantity(1)}
                                            className="w-10 h-10 flex items-center justify-center text-surface-500 hover:bg-surface-100 rounded-lg transition-colors"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>

                                    {/* Buy Button */}
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 btn-primary text-lg flex items-center justify-center gap-2 h-12"
                                    >
                                        <ShoppingCart size={20} />
                                        Adicionar ao Carrinho
                                    </button>
                                </div>
                            </div>

                            {/* Shipping Calculator Mock */}
                            <div className="pt-6 border-t border-surface-200">
                                <label className="block text-sm font-semibold text-surface-700 mb-2 flex items-center gap-2">
                                    <Truck size={16} /> Calcular Frete Estimado
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="CEP"
                                        value={cep}
                                        onChange={(e) => setCep(e.target.value)}
                                        className="w-32 px-3 py-2 border border-surface-200 rounded-lg text-sm outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                    />
                                    <button
                                        onClick={handleCalculateShipping}
                                        className="btn-secondary text-sm"
                                    >
                                        Calcular
                                    </button>
                                </div>
                                {shippingResult && (
                                    <div className="mt-3 text-sm flex items-center gap-2 text-surface-600 bg-surface-50 p-2 rounded-lg border border-surface-100">
                                        <span className="font-semibold text-surface-900">{shippingResult.name}</span>
                                        <span>-</span>
                                        <span>Até {shippingResult.days} dias úteis</span>
                                        <span className="font-bold text-surface-900 ml-auto">
                                            R$ {shippingResult.price.toFixed(2).replace('.', ',')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabbed Content (Description & Specs) */}
                <div className="border-t border-surface-200 bg-surface-50">
                    <div className="p-8 max-w-4xl">
                        <h2 className="text-xl font-display font-semibold text-surface-900 mb-6 flex items-center gap-2">
                            <Package size={20} />
                            Informações do Produto
                        </h2>

                        <div className="space-y-8">
                            <div>
                                <h3 className="font-semibold text-surface-900 mb-2">Descrição</h3>
                                <p className="text-surface-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-surface-900 mb-4">Especificações Técnicas</h3>
                                <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <tbody className="divide-y divide-surface-100">
                                            {product.specifications.map((spec, index) => (
                                                <tr key={index} className={index % 2 === 0 ? 'bg-surface-50/50' : 'bg-white'}>
                                                    <th className="px-6 py-3 font-medium text-surface-900 w-1/3 border-r border-surface-100">{spec.label}</th>
                                                    <td className="px-6 py-3 text-surface-600">{spec.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
