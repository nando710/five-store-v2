import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.API_PORT || 3001;

// ── Config ──────────────────────────────────────────────────────────────────
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_BASE_URL = process.env.ASAAS_BASE_URL || 'https://sandbox.asaas.com/api';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ASAAS_API_KEY) {
    console.error('❌ ASAAS_API_KEY não configurada no .env');
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

app.use(cors());
app.use(express.json());

// ── Asaas API helper ────────────────────────────────────────────────────────
async function asaasRequest(endpoint, method, body) {
    const res = await fetch(`${ASAAS_BASE_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'access_token': ASAAS_API_KEY
        },
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await res.json();
    if (!res.ok) {
        console.error('[Asaas] Erro:', JSON.stringify(data));
        throw new Error(data.errors?.[0]?.description || 'Erro na API Asaas');
    }
    return data;
}

async function findOrCreateCustomer(profile) {
    const cpfCnpj = profile.cnpj?.replace(/\D/g, '') || '';

    // Try to find existing customer
    if (cpfCnpj) {
        const existing = await asaasRequest(`/v3/customers?cpfCnpj=${cpfCnpj}`, 'GET');
        if (existing.data?.length > 0) {
            return existing.data[0].id;
        }
    }

    // Create new customer
    const customer = await asaasRequest('/v3/customers', 'POST', {
        name: profile.store_name || profile.name,
        email: profile.email,
        phone: profile.phone?.replace(/\D/g, '') || undefined,
        cpfCnpj: cpfCnpj || undefined,
        notificationDisabled: false
    });

    return customer.id;
}

// ── Auth middleware ──────────────────────────────────────────────────────────
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
        return res.status(401).json({ error: 'Token inválido' });
    }

    req.user = user;
    next();
}

// ── POST /api/create-payment ────────────────────────────────────────────────
app.post('/api/create-payment', authMiddleware, async (req, res) => {
    try {
        const { orderId, billingType, creditCard, creditCardHolderInfo } = req.body;
        const userId = req.user.id;

        // 1. Fetch order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', userId)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        // 2. Fetch profile
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (!profile) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }

        // 3. Find or create Asaas customer
        let customerId = profile.asaas_customer_id;
        if (!customerId) {
            customerId = await findOrCreateCustomer(profile);
            await supabaseAdmin
                .from('profiles')
                .update({ asaas_customer_id: customerId })
                .eq('id', userId);
        }

        // 4. Create payment on Asaas
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (billingType === 'BOLETO' ? 3 : 1));
        const dueDateStr = dueDate.toISOString().split('T')[0];

        const paymentPayload = {
            customer: customerId,
            billingType,
            value: order.total_amount,
            dueDate: dueDateStr,
            description: `Five Store - Pedido #${orderId.slice(0, 8).toUpperCase()}`,
            externalReference: orderId
        };

        // Add credit card data
        if (billingType === 'CREDIT_CARD' && creditCard && creditCardHolderInfo) {
            paymentPayload.creditCard = {
                holderName: creditCard.holderName,
                number: creditCard.number.replace(/\s/g, ''),
                expiryMonth: creditCard.expiryMonth,
                expiryYear: creditCard.expiryYear,
                ccv: creditCard.ccv
            };
            paymentPayload.creditCardHolderInfo = creditCardHolderInfo;
        }

        const payment = await asaasRequest('/v3/payments', 'POST', paymentPayload);

        // 5. Update order in DB
        const newStatus = billingType === 'CREDIT_CARD' && payment.status === 'CONFIRMED'
            ? 'approved'
            : 'pending';

        await supabaseAdmin
            .from('orders')
            .update({
                asaas_payment_id: payment.id,
                asaas_invoice_id: payment.invoiceUrl,
                payment_method: billingType,
                status: newStatus
            })
            .eq('id', orderId);

        // 6. Build response
        const response = {
            paymentId: payment.id,
            status: payment.status,
            invoiceUrl: payment.invoiceUrl,
            billingType
        };

        // Fetch PIX QR Code
        if (billingType === 'PIX') {
            try {
                const pixData = await asaasRequest(`/v3/payments/${payment.id}/pixQrCode`, 'GET');
                response.pixQrCode = pixData.encodedImage;
                response.pixCopyPaste = pixData.payload;
                response.pixExpirationDate = pixData.expirationDate;
            } catch (e) {
                console.error('[Asaas] Erro QR Code PIX:', e.message);
            }
        }

        // Boleto URL
        if (billingType === 'BOLETO') {
            response.bankSlipUrl = payment.bankSlipUrl;
        }

        res.json(response);

    } catch (err) {
        console.error('[create-payment] Error:', err.message);
        res.status(500).json({ error: err.message || 'Erro interno' });
    }
});

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', asaas: !!ASAAS_API_KEY });
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`✅ API Server rodando em http://localhost:${PORT}`);
    console.log(`   Asaas: ${ASAAS_BASE_URL}`);
});
