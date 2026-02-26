-- ============================================================
-- MIGRAÇÃO: Adicionar campos Asaas
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar ID do cliente Asaas no perfil do franqueado
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

-- 2. Adicionar ID do pagamento Asaas no pedido
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS asaas_payment_id TEXT;
