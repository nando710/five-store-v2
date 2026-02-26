import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY")!;
const ASAAS_BASE_URL = Deno.env.get("ASAAS_BASE_URL") || "https://sandbox.asaas.com/api";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
    orderId: string;
    billingType: "PIX" | "BOLETO" | "CREDIT_CARD";
    creditCard?: {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
    };
    creditCardHolderInfo?: {
        name: string;
        cpfCnpj: string;
        email: string;
        phone: string;
        postalCode: string;
        addressNumber: string;
    };
}

// ── Asaas API helpers ──────────────────────────────────────────────────────

async function asaasRequest(endpoint: string, method: string, body?: object) {
    const res = await fetch(`${ASAAS_BASE_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            access_token: ASAAS_API_KEY,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) {
        console.error("[Asaas] Erro:", JSON.stringify(data));
        throw new Error(data.errors?.[0]?.description || "Erro na API Asaas");
    }
    return data;
}

async function findOrCreateCustomer(profile: any): Promise<string> {
    const cpfCnpj = profile.cnpj?.replace(/\D/g, "") || "";

    // Try to find existing customer by cpfCnpj
    if (cpfCnpj) {
        const existing = await asaasRequest(
            `/v3/customers?cpfCnpj=${cpfCnpj}`,
            "GET"
        );
        if (existing.data?.length > 0) {
            return existing.data[0].id;
        }
    }

    // Create new customer
    const customer = await asaasRequest("/v3/customers", "POST", {
        name: profile.store_name || profile.name,
        email: profile.email,
        phone: profile.phone?.replace(/\D/g, "") || undefined,
        cpfCnpj: cpfCnpj || undefined,
        notificationDisabled: false,
    });

    return customer.id;
}

// ── Main handler ───────────────────────────────────────────────────────────

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Verify JWT from Authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(JSON.stringify({ error: "Não autorizado" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Decode user from JWT
        const token = authHeader.replace("Bearer ", "");
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Token inválido" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body: PaymentRequest = await req.json();
        const { orderId, billingType, creditCard, creditCardHolderInfo } = body;

        // 1. Fetch order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .eq("user_id", user.id)
            .single();

        if (orderError || !order) {
            return new Response(
                JSON.stringify({ error: "Pedido não encontrado" }),
                {
                    status: 404,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // 2. Fetch user profile
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

        if (!profile) {
            return new Response(
                JSON.stringify({ error: "Perfil não encontrado" }),
                {
                    status: 404,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
            );
        }

        // 3. Find or create Asaas customer
        let customerId = profile.asaas_customer_id;
        if (!customerId) {
            customerId = await findOrCreateCustomer(profile);
            // Save customer ID to profile for reuse
            await supabase
                .from("profiles")
                .update({ asaas_customer_id: customerId })
                .eq("id", user.id);
        }

        // 4. Create payment on Asaas
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (billingType === "BOLETO" ? 3 : 1));
        const dueDateStr = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD

        const paymentPayload: any = {
            customer: customerId,
            billingType,
            value: order.total_amount,
            dueDate: dueDateStr,
            description: `Five Store - Pedido #${orderId.slice(0, 8).toUpperCase()}`,
            externalReference: orderId,
        };

        // Add credit card data if paying with card
        if (billingType === "CREDIT_CARD" && creditCard && creditCardHolderInfo) {
            paymentPayload.creditCard = {
                holderName: creditCard.holderName,
                number: creditCard.number.replace(/\s/g, ""),
                expiryMonth: creditCard.expiryMonth,
                expiryYear: creditCard.expiryYear,
                ccv: creditCard.ccv,
            };
            paymentPayload.creditCardHolderInfo = creditCardHolderInfo;
        }

        const payment = await asaasRequest("/v3/payments", "POST", paymentPayload);

        // 5. Update order in DB with Asaas IDs
        const newStatus =
            billingType === "CREDIT_CARD" && payment.status === "CONFIRMED"
                ? "approved"
                : "pending";

        await supabase
            .from("orders")
            .update({
                asaas_payment_id: payment.id,
                asaas_invoice_id: payment.invoiceUrl,
                payment_method: billingType,
                status: newStatus,
            })
            .eq("id", orderId);

        // 6. Build response with payment details
        const response: any = {
            paymentId: payment.id,
            status: payment.status,
            invoiceUrl: payment.invoiceUrl,
            billingType,
        };

        // Fetch PIX QR Code if applicable
        if (billingType === "PIX") {
            try {
                const pixData = await asaasRequest(
                    `/v3/payments/${payment.id}/pixQrCode`,
                    "GET"
                );
                response.pixQrCode = pixData.encodedImage; // base64
                response.pixCopyPaste = pixData.payload; // copia-e-cola
                response.pixExpirationDate = pixData.expirationDate;
            } catch (e) {
                console.error("[Asaas] Erro ao buscar QR Code PIX:", e);
                // PIX QR code might take a moment, pass invoiceUrl as fallback
            }
        }

        // Boleto bank slip URL
        if (billingType === "BOLETO") {
            response.bankSlipUrl = payment.bankSlipUrl;
        }

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err: any) {
        console.error("[create-payment] Error:", err.message);
        return new Response(
            JSON.stringify({ error: err.message || "Erro interno" }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
