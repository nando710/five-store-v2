-- ============================================================
-- CORREÇÃO DEFINITIVA DO LOGIN
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Remover TODAS as policies problemáticas de profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- 2. Criar function is_admin() SECURITY DEFINER (se não existir)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 3. Recriar policies sem recursão
-- Usuários podem ver APENAS o próprio perfil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Admins podem gerenciar todos os perfis (usa function SECURITY DEFINER)
CREATE POLICY "Admins have full access to profiles"
ON public.profiles FOR ALL
USING (public.is_admin());

-- 4. Criar function para buscar perfil de forma segura (bypassa RLS)
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 5. Garantir que o perfil admin existe
INSERT INTO public.profiles (id, name, email, role, status, tier)
SELECT id, 'Administrador Five', email, 'admin', 'active', 1
FROM auth.users WHERE email = 'admin@admin.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active';

-- 6. Confirmar email
UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = 'admin@admin.com';
