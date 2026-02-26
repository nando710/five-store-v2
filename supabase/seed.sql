-- Arquivo de Seed para preencher o banco com dados de teste
-- Five Store v2

-- Limpar dados existentes (se aplicável) para evitar duplicatas nos testes
TRUNCATE TABLE public.order_items CASCADE;
TRUNCATE TABLE public.orders CASCADE;
TRUNCATE TABLE public.products CASCADE;
TRUNCATE TABLE public.categories CASCADE;

-- 1. Inserir Categorias Principais
INSERT INTO public.categories (id, name, slug) VALUES
('11111111-1111-1111-1111-111111111111', 'Embalagens', 'embalagens'),
('22222222-2222-2222-2222-222222222222', 'Insumos', 'insumos'),
('33333333-3333-3333-3333-333333333333', 'Uniformes', 'uniformes'),
('44444444-4444-4444-4444-444444444444', 'Marketing', 'marketing'),
('55555555-5555-5555-5555-555555555555', 'Limpeza', 'limpeza');

-- 2. Inserir Subcategorias
INSERT INTO public.categories (id, name, slug, parent_id) VALUES
('1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', 'Copos e Tampas', 'copos', '11111111-1111-1111-1111-111111111111'),
('1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b', 'Sacolas Kraft', 'sacolas', '11111111-1111-1111-1111-111111111111'),
('1c1c1c1c-1c1c-1c1c-1c1c-1c1c1c1c1c1c', 'Canudos e Guardanapos', 'acessorios', '11111111-1111-1111-1111-111111111111'),
('2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a2a', 'Bases e Pós', 'bases', '22222222-2222-2222-2222-222222222222'),
('2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', 'Essências e Xaropes', 'essencias', '22222222-2222-2222-2222-222222222222'),
('3a3a3a3a-3a3a-3a3a-3a3a-3a3a3a3a3a3a', 'Camisetas e Polos', 'camisetas', '33333333-3333-3333-3333-333333333333'),
('3b3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b', 'Aventais e Toucas', 'aventais', '33333333-3333-3333-3333-333333333333');

-- 3. Inserir Produtos
INSERT INTO public.products (id, name, sku, category_id, price_tier1, price_tier2, price_tier3, stock, pack_size, status) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Copo Descartável Biodegradável 500ml', 'EMB-001', '1a1a1a1a-1a1a-1a1a-1a1a-1a1a1a1a1a1a', 45.90, 41.50, 39.00, 1500, 'PCT c/ 100', 'active'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Essência de Morango Concentrada 1L', 'INS-045', '2b2b2b2b-2b2b-2b2b-2b2b-2b2b2b2b2b2b', 89.00, 80.00, 75.00, 320, '1 Unidade', 'active'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Avental Personalizado Five', 'UNI-012', '3b3b3b3b-3b3b-3b3b-3b3b-3b3b3b3b3b3b', 65.00, 60.00, 55.00, 85, '1 Unidade', 'active'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Sacola Kraft G (Pacotes)', 'EMB-008', '1b1b1b1b-1b1b-1b1b-1b1b-1b1b1b1b1b1b', 110.00, 100.00, 90.00, 200, 'PCT c/ 250', 'active'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Base Neutra para Frappé 2kg', 'INS-088', '2a2a2a2a-2a2a-2a2a-2a2a-2a2a2a2a2a2a', 135.50, 125.00, 115.00, 400, '1 Unidade', 'active'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Guardanapo Papel Premium', 'EMB-015', '1c1c1c1c-1c1c-1c1c-1c1c-1c1c1c1c1c1c', 28.00, 25.00, 20.00, 5000, 'CX c/ 1000', 'active'),
('12345678-1234-1234-1234-123456789012', 'Camiseta Polo Uniforme (G)', 'UNI-023', '3a3a3a3a-3a3a-3a3a-3a3a-3a3a3a3a3a3a', 85.00, 78.00, 70.00, 120, '1 Unidade', 'active'),
('87654321-4321-4321-4321-210987654321', 'Banner Promo de Inverno', 'MKT-011', '44444444-4444-4444-4444-444444444444', 150.00, 135.00, 120.00, 30, '1 Unidade', 'active');
