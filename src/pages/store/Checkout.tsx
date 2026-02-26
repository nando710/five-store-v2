import { useState } from 'react';
import {
    CreditCard,
    QrCode,
    Barcode,
    ShieldCheck,
    CheckCircle,
    Truck,
    Copy,
    ExternalLink,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PaymentResult {
    paymentId: string;
    status: string;
    invoiceUrl: string;
    billingType: string;
    pixQrCode?: string;     // base64 image
    pixCopyPaste?: string;  // copia-e-cola text
    bankSlipUrl?: string;
}

export function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { items, subtotal, placeOrder } = useCart();

    const shippingCost: number = location.state?.shippingCost || 0;
    const total = subtotal + shippingCost;

    const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const [pixCopied, setPixCopied] = useState(false);

    // Credit card form state
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const handlePayment = async () => {
        if (items.length === 0) return;
        setError('');
        setIsProcessing(true);

        try {
            // 1. Create the order in Supabase
            const newOrderId = await placeOrder(shippingCost, paymentMethod, {});
            if (!newOrderId) {
                throw new Error('Erro ao criar pedido no banco de dados.');
            }
            setOrderId(newOrderId);

            // 2. Get current auth session token
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error('Sessão expirada. Faça login novamente.');
            }

            // 3. Call local Express API to create Asaas payment
            const payload: any = {
                orderId: newOrderId,
                billingType: paymentMethod,
            };

            // Add credit card details if applicable
            if (paymentMethod === 'CREDIT_CARD') {
                const [expMonth, expYear] = cardExpiry.split('/');
                payload.creditCard = {
                    holderName: cardName,
                    number: cardNumber,
                    expiryMonth: expMonth?.trim(),
                    expiryYear: `20${expYear?.trim()}`,
                    ccv: cardCvv,
                };
                payload.creditCardHolderInfo = {
                    name: cardName || user?.name,
                    cpfCnpj: user?.cnpj?.replace(/\D/g, '') || '',
                    email: user?.email || '',
                    phone: user?.phone?.replace(/\D/g, '') || '',
                    postalCode: '',
                    addressNumber: '',
                };
            }

            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao processar pagamento.');
            }

            setPaymentResult(data as PaymentResult);

        } catch (err: any) {
            console.error('[Checkout] Erro:', err);
            setError(err.message || 'Erro inesperado ao processar pagamento.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCopyPix = () => {
        if (paymentResult?.pixCopyPaste) {
            navigator.clipboard.writeText(paymentResult.pixCopyPaste);
            setPixCopied(true);
            setTimeout(() => setPixCopied(false), 3000);
        }
    };

    // ── Success / Payment Result Screen ─────────────────────────────────────
    if (paymentResult) {
        const isCreditCardConfirmed = paymentResult.billingType === 'CREDIT_CARD' &&
            (paymentResult.status === 'CONFIRMED' || paymentResult.status === 'RECEIVED');

        return (
            <div className="max-w-2xl mx-auto mt-8 space-y-8">
                {/* Header */}
                <div className="text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isCreditCardConfirmed ? 'bg-green-100' : 'bg-brand-100'}`}>
                        {isCreditCardConfirmed ? (
                            <CheckCircle size={40} className="text-green-500" />
                        ) : (
                            paymentResult.billingType === 'PIX' ? <QrCode size={40} className="text-brand-600" /> : <Barcode size={40} className="text-brand-600" />
                        )}
                    </div>
                    <h1 className="text-3xl font-display font-semibold text-surface-900 mb-2">
                        {isCreditCardConfirmed ? 'Pagamento Confirmado!' : 'Cobrança Gerada!'}
                    </h1>
                    <p className="text-surface-500 max-w-md mx-auto">
                        {isCreditCardConfirmed
                            ? 'Seu pagamento foi aprovado e o pedido já está na fila de expedição.'
                            : paymentResult.billingType === 'PIX'
                                ? 'Escaneie o QR Code abaixo ou copie o código para pagar via PIX.'
                                : 'Clique no botão abaixo para visualizar e pagar o boleto.'
                        }
                    </p>
                </div>

                {/* PIX QR Code */}
                {paymentResult.billingType === 'PIX' && (
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-surface-200 bg-surface-50 text-center">
                            <h2 className="font-semibold text-surface-900 flex items-center justify-center gap-2">
                                <QrCode size={18} className="text-brand-600" />
                                Pague com PIX
                            </h2>
                            <p className="text-xs text-surface-500 mt-1">Válido por 15 minutos</p>
                        </div>
                        <div className="p-8 flex flex-col items-center gap-6">
                            {paymentResult.pixQrCode ? (
                                <div className="bg-white p-4 rounded-xl border-2 border-surface-200">
                                    <img
                                        src={`data:image/png;base64,${paymentResult.pixQrCode}`}
                                        alt="QR Code PIX"
                                        className="w-56 h-56"
                                    />
                                </div>
                            ) : (
                                <div className="w-56 h-56 bg-surface-100 rounded-xl flex items-center justify-center text-surface-400">
                                    <Loader2 size={32} className="animate-spin" />
                                </div>
                            )}

                            {paymentResult.pixCopyPaste && (
                                <div className="w-full max-w-md">
                                    <label className="block text-xs font-semibold text-surface-700 mb-1.5 uppercase tracking-wider">
                                        Código Copia e Cola
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            readOnly
                                            value={paymentResult.pixCopyPaste}
                                            className="flex-1 px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs font-mono text-surface-700 truncate"
                                        />
                                        <button
                                            onClick={handleCopyPix}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${pixCopied
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-brand-500 text-white hover:bg-brand-600'
                                                }`}
                                        >
                                            {pixCopied ? <><CheckCircle size={14} /> Copiado!</> : <><Copy size={14} /> Copiar</>}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Boleto */}
                {paymentResult.billingType === 'BOLETO' && (
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-8 text-center space-y-4">
                        <Barcode size={48} className="text-surface-400 mx-auto" />
                        <p className="text-surface-600">Seu boleto foi gerado com vencimento em <strong>3 dias úteis</strong>.</p>
                        {paymentResult.bankSlipUrl && (
                            <a
                                href={paymentResult.bankSlipUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <ExternalLink size={16} /> Visualizar Boleto
                            </a>
                        )}
                    </div>
                )}

                {/* Order summary card */}
                <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm text-left">
                    <h3 className="font-semibold text-surface-900 mb-4 border-b border-surface-100 pb-2">Resumo do Pedido</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-surface-500">Pedido:</span>
                            <span className="font-bold text-surface-900 font-mono">#{orderId?.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-surface-500">Valor Total:</span>
                            <span className="font-bold text-brand-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-surface-500">Método:</span>
                            <span className="font-medium text-surface-900">
                                {paymentResult.billingType === 'PIX' ? 'PIX' : paymentResult.billingType === 'BOLETO' ? 'Boleto' : 'Cartão de Crédito'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Invoice link + orders button */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    {paymentResult.invoiceUrl && (
                        <a
                            href={paymentResult.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary flex justify-center items-center gap-2"
                        >
                            <ExternalLink size={16} /> Ver Fatura Asaas
                        </a>
                    )}
                    <button onClick={() => navigate('/store/orders')} className="btn-primary flex justify-center items-center gap-2">
                        <Truck size={16} /> Acompanhar Pedido
                    </button>
                </div>
            </div>
        );
    }

    // ── Main Checkout Form ──────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="max-w-3xl mx-auto mt-12 text-center">
                <p className="text-surface-500 text-lg">Seu carrinho está vazio.</p>
                <button onClick={() => navigate('/store')} className="btn-primary mt-4">Ir ao Catálogo</button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-display font-semibold text-surface-900">Finalizar Compra</h1>
                <p className="text-surface-500 mt-1">Ambiente seguro intermediado por Asaas.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Payment Methods */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-surface-200 bg-surface-50 flex items-center gap-2">
                            <ShieldCheck className="text-green-500" size={20} />
                            <h2 className="font-semibold text-surface-900">Forma de Pagamento</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* PIX */}
                            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'PIX' ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="payment" value="PIX" checked={paymentMethod === 'PIX'} onChange={() => setPaymentMethod('PIX')} className="w-4 h-4 text-brand-600" />
                                        <div className="flex items-center gap-2">
                                            <QrCode size={24} className={paymentMethod === 'PIX' ? 'text-brand-600' : 'text-surface-400'} />
                                            <span className="font-medium text-surface-900">PIX</span>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">Aprovação Instantânea</span>
                                </div>
                                {paymentMethod === 'PIX' && (
                                    <div className="mt-4 pl-7 text-sm text-surface-500 border-t border-brand-200 pt-4">
                                        Ao finalizar, um QR Code será gerado. Você terá 15 minutos para pagar no app do seu banco.
                                    </div>
                                )}
                            </label>

                            {/* Cartão */}
                            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'CREDIT_CARD' ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'}`}>
                                <div className="flex items-center gap-3">
                                    <input type="radio" name="payment" value="CREDIT_CARD" checked={paymentMethod === 'CREDIT_CARD'} onChange={() => setPaymentMethod('CREDIT_CARD')} className="w-4 h-4 text-brand-600" />
                                    <div className="flex items-center gap-2">
                                        <CreditCard size={24} className={paymentMethod === 'CREDIT_CARD' ? 'text-brand-600' : 'text-surface-400'} />
                                        <span className="font-medium text-surface-900">Cartão de Crédito</span>
                                    </div>
                                </div>
                                {paymentMethod === 'CREDIT_CARD' && (
                                    <div className="mt-4 pl-7 space-y-4 border-t border-brand-200 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="block text-xs font-semibold text-surface-700 mb-1">Número do Cartão</label>
                                                <input type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="w-full px-3 py-2 border border-surface-300 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm" />
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-xs font-semibold text-surface-700 mb-1">Nome no Cartão</label>
                                                <input type="text" placeholder="JOAO C SILVA" value={cardName} onChange={e => setCardName(e.target.value)} className="w-full px-3 py-2 border border-surface-300 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm uppercase" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-surface-700 mb-1">Validade</label>
                                                <input type="text" placeholder="MM/AA" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} className="w-full px-3 py-2 border border-surface-300 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-surface-700 mb-1">CVV</label>
                                                <input type="text" placeholder="123" value={cardCvv} onChange={e => setCardCvv(e.target.value)} className="w-full px-3 py-2 border border-surface-300 rounded-lg outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </label>

                            {/* Boleto */}
                            <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'BOLETO' ? 'border-brand-500 bg-brand-50' : 'border-surface-200 hover:border-surface-300'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="payment" value="BOLETO" checked={paymentMethod === 'BOLETO'} onChange={() => setPaymentMethod('BOLETO')} className="w-4 h-4 text-brand-600" />
                                        <div className="flex items-center gap-2">
                                            <Barcode size={24} className={paymentMethod === 'BOLETO' ? 'text-brand-600' : 'text-surface-400'} />
                                            <span className="font-medium text-surface-900">Boleto Bancário</span>
                                        </div>
                                    </div>
                                    <span className="text-xs bg-surface-100 text-surface-600 px-2 py-0.5 rounded font-bold">Venc. 3 dias</span>
                                </div>
                                {paymentMethod === 'BOLETO' && (
                                    <div className="mt-4 pl-7 text-sm text-surface-500 border-t border-brand-200 pt-4">
                                        O boleto será gerado ao final. A compensação pode levar até 2 dias úteis.
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm sticky top-24">
                        <div className="p-6 border-b border-surface-200">
                            <h2 className="font-semibold text-surface-900">Resumo da Compra</h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between text-surface-600 text-sm">
                                <span>Produtos ({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
                                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between text-surface-600 text-sm">
                                <span>Frete</span>
                                <span>R$ {shippingCost.toFixed(2).replace('.', ',')}</span>
                            </div>

                            <div className="border-t border-surface-200 pt-4 mt-2">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="font-semibold text-surface-900">Total</span>
                                    <div className="text-right">
                                        <span className="block text-2xl font-display font-bold text-brand-600 leading-none">
                                            R$ {total.toFixed(2).replace('.', ',')}
                                        </span>
                                        <span className="text-xs text-surface-400">Processado por Asaas</span>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                    {error}
                                </div>
                            )}

                            <button
                                className="w-full btn-primary py-3 text-lg mt-4 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                onClick={handlePayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck size={20} />
                                        Pagar Agora
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
