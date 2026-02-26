import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface CartItem {
    id: string;        // product UUID
    name: string;
    sku: string;
    price: number;     // price already resolved for user's tier
    quantity: number;
    imgColor?: string;
    packSize?: string;
}

interface CartContextType {
    items: CartItem[];
    totalItems: number;
    subtotal: number;
    addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
    updateQuantity: (id: string, delta: number) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    placeOrder: (shippingCost: number, paymentMethod: string, shippingAddress: object) => Promise<string | null>;
    isPlacingOrder: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = 'five_store_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Persist cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>, qty = 1) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === newItem.id);
            if (existing) {
                return prev.map(i => i.id === newItem.id
                    ? { ...i, quantity: i.quantity + qty }
                    : i
                );
            }
            return [...prev, { ...newItem, quantity: qty }];
        });
    }, []);

    const updateQuantity = useCallback((id: string, delta: number) => {
        setItems(prev => prev.map(item =>
            item.id === id
                ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                : item
        ));
    }, []);

    const removeItem = useCallback((id: string) => {
        setItems(prev => prev.filter(i => i.id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
        localStorage.removeItem(CART_KEY);
    }, []);

    /**
     * Saves the current cart as a real Supabase order.
     * Returns the new order ID on success, null on failure.
     */
    const placeOrder = async (
        shippingCost: number,
        paymentMethod: string,
        shippingAddress: object
    ): Promise<string | null> => {
        if (!user || items.length === 0) return null;

        setIsPlacingOrder(true);
        try {
            const totalAmount = subtotal + shippingCost;

            // 1. Insert order header
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: totalAmount,
                    shipping_cost: shippingCost,
                    status: 'pending',
                    payment_method: paymentMethod,
                    shipping_address: shippingAddress
                })
                .select()
                .single();

            if (orderError || !order) {
                console.error('Erro ao criar pedido:', orderError?.message);
                return null;
            }

            // 2. Insert order items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                product_sku: item.sku,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error('Erro ao salvar itens do pedido:', itemsError.message);
                // Rollback: delete the orphan order
                await supabase.from('orders').delete().eq('id', order.id);
                return null;
            }

            clearCart();
            return order.id;
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

    return (
        <CartContext.Provider value={{
            items, totalItems, subtotal,
            addItem, updateQuantity, removeItem, clearCart,
            placeOrder, isPlacingOrder
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
