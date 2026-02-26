import {
    Trash2, Minus, Plus, Truck, ArrowRight, ShieldCheck, ShoppingCart
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';

export function Cart() {
    const navigate = useNavigate();
    const { items, subtotal, updateQuantity, removeItem } = useCart();
    const [cep, setCep] = useState('');
    const [shippingOption, setShippingOption] = useState<string | null>(null);

    // Simulated Frenet shipping options (to be replaced with real Frenet API)
    const shippingOptionsMock = [
        { id: 'sedex', name: 'Correios SEDEX', days: 5, price: 42.50 },
        { id: 'pac', name: 'Correios PAC', days: 12, price: 21.30 },
        { id: 'jadlog', name: 'Jadlog Package', days: 7, price: 28.90 },
    ];

    const handleCalculateShipping = () => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            setShippingOption('sedex');
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-surface-100 rounded-full flex items-center justify-center text-surface-400 mb-6">
                    <ShoppingCart size={40} />
                </div>
                <h2 className="text-2xl font-display font-semibold text-surface-900 mb-2">Seu carrinho está vazio</h2>
                <p className="text-surface-500 mb-8 max-w-md">Você ainda não adicionou nenhum insumo ou embalagem ao seu pedido.</p>
                <Link to="/store" className="btn-primary">
                    Continuar Comprando
                </Link>
            </div>
        );
    }

    const shippingCost = shippingOption
        ? shippingOptionsMock.find(o => o.id === shippingOption)?.price || 0
        : 0;
    const total = subtotal + shippingCost;

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-display font-semibold text-surface-900">Meu Carrinho</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Cart Items */}
                <div className="flex-1 space-y-4">
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                        <div className="divide-y divide-surface-100">
                            {items.map(item => (
                                <div key={item.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                                    {/* Thumbnail */}
                                    <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex-shrink-0 ${item.imgColor || 'bg-brand-50'} flex items-center justify-center text-surface-400/50`}>
                                        <span className="text-2xl font-display font-black">F</span>
                                    </div>

                                    <div className="flex-1 min-w-0 w-full">
                                        <div className="flex justify-between items-start mb-1">
                                            <div>
                                                <div className="text-xs font-mono text-surface-400 leading-none mb-1">{item.sku}</div>
                                                <h3 className="font-semibold text-surface-900 line-clamp-2 pr-4">{item.name}</h3>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-surface-400 hover:text-red-500 transition-colors p-1"
                                                title="Remover Item"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="text-xs text-surface-500 mb-4">{item.packSize}</div>

                                        <div className="flex items-center justify-between">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center bg-surface-50 rounded-lg border border-surface-200">
                                                <button
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-l-lg transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-10 text-center font-medium text-sm text-surface-900">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-r-lg transition-colors"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-bold text-surface-900">
                                                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                                </div>
                                                <div className="text-xs text-surface-400">
                                                    R$ {item.price.toFixed(2).replace('.', ',')} / un.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary & Shipping */}
                <div className="w-full lg:w-96 flex-shrink-0 space-y-6">
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 sticky top-24">
                        <h2 className="font-semibold text-surface-900 mb-4">Resumo do Pedido</h2>

                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between text-surface-600">
                                <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                                <span className="font-medium text-surface-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>

                            {/* Shipping Calculator */}
                            <div className="bg-surface-50 rounded-xl p-4 border border-surface-200">
                                <label className="block text-xs font-semibold text-surface-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Truck size={14} />
                                    Calcular Frete (Frenet)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="00000-000"
                                        className="flex-1 px-3 py-2 text-sm border border-surface-300 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                                        value={cep}
                                        onChange={(e) => setCep(e.target.value)}
                                        maxLength={9}
                                    />
                                    <button
                                        onClick={handleCalculateShipping}
                                        className="px-3 bg-surface-200 hover:bg-surface-300 text-surface-700 font-medium rounded-lg text-sm transition-colors"
                                    >
                                        OK
                                    </button>
                                </div>

                                {shippingOption && (
                                    <div className="mt-3 space-y-2">
                                        {shippingOptionsMock.map(opt => (
                                            <label key={opt.id} className="flex items-start gap-2 text-xs">
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    checked={shippingOption === opt.id}
                                                    onChange={() => setShippingOption(opt.id)}
                                                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                                                />
                                                <div className="flex-1 flex justify-between">
                                                    <div>
                                                        <span className="font-medium text-surface-900 block">{opt.name}</span>
                                                        <span className="text-surface-500">Até {opt.days} dias úteis</span>
                                                    </div>
                                                    <span className="font-bold text-surface-900">
                                                        R$ {opt.price.toFixed(2).replace('.', ',')}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {shippingOption && (
                                <div className="flex justify-between text-surface-600">
                                    <span>Frete</span>
                                    <span className="font-medium text-surface-900">R$ {shippingCost.toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-surface-200 pt-4 mb-6">
                            <div className="flex justify-between items-end">
                                <span className="font-semibold text-surface-900">Total a Pagar</span>
                                <span className="text-2xl font-display font-bold text-brand-600 leading-none">
                                    R$ {total.toFixed(2).replace('.', ',')}
                                </span>
                            </div>
                            {!shippingOption && (
                                <p className="text-xs text-orange-500 text-right mt-1">* Calcule o frete para prosseguir</p>
                            )}
                        </div>

                        <button
                            className="w-full btn-primary py-3 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            disabled={!shippingOption}
                            onClick={() => navigate('/store/checkout', {
                                state: {
                                    shippingCost,
                                    shippingOptionId: shippingOption
                                }
                            })}
                        >
                            Ir para Pagamento
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-surface-500 bg-green-50/50 py-2 rounded-lg border border-green-100">
                            <ShieldCheck size={14} className="text-green-600" />
                            <span>Compra 100% segura com Asaas</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
