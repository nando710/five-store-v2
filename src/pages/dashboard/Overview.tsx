import {
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Component,
    AlertTriangle,
    XOctagon
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell
} from 'recharts';

export function Overview() {
    // Mock Data based on the user's reference image
    const salesData = [
        { name: '1', value: 0 },
        { name: '5', value: 0 },
        { name: '10', value: 0 },
        { name: '15', value: 0 },
        { name: '20', value: 4121.75 },
        { name: '25', value: 4121.75 },
        { name: '30', value: 4121.75 }
    ];

    const categoryData = [
        { name: 'Alpha', value: 35 },
        { name: 'Bravo', value: 55 },
        { name: 'Charlie', value: 33 },
        { name: 'Delta', value: 15 },
        { name: 'Echo', value: 95 }
    ];

    const topProductsData = [
        { name: 'PRODUTO 01', value: 8 },
        { name: 'PRODUTO 02', value: 8 },
        { name: 'PRODUTO 03', value: 8 },
        { name: 'PRODUTO 04', value: 8 },
        { name: 'PRODUTO 05', value: 4 },
        { name: 'PRODUTO 06', value: 4 },
        { name: 'PRODUTO 07', value: 4 }
    ];

    const unidadeData = [
        { name: 'Five Paulista', value: 4121.75 }
    ];

    const statusData = [
        { name: 'Aprovado', value: 100 }
    ];

    const paymentData = [
        { name: 'PIX', value: 100 }
    ];

    const PIE_COLOR = '#6366f1'; // brand-500
    const BAR_COLOR_BLUE = '#3b82f6';

    // Custom Tooltip for light mode
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-surface-200 p-3 rounded-lg shadow-xl">
                    <p className="text-surface-500 text-xs mb-1">{`Ref: ${label}`}</p>
                    <p className="text-brand-600 font-semibold text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Title */}
            <div>
                <h1 className="text-2xl font-display font-semibold text-surface-900">Painel Administrativo</h1>
            </div>

            {/* Time Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['Hoje', '7 dias', '30 dias', '12 meses', 'Personalizado'].map(pill => (
                    <button
                        key={pill}
                        className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${pill === 'Hoje'
                            ? 'bg-brand-50 text-brand-600 border border-brand-200'
                            : 'bg-white text-surface-600 border border-surface-200 hover:text-surface-900 hover:bg-surface-50'
                            }`}
                    >
                        {pill}
                    </button>
                ))}
            </div>

            {/* Top 4 Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-surface-200 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                        <DollarSign size={20} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-surface-500 text-xs font-medium mb-0.5">Faturamento Total</p>
                        <h3 className="text-xl font-display font-bold text-surface-900">R$ 4.121,75</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-surface-200 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                        <ShoppingCart size={20} className="text-brand-500" />
                    </div>
                    <div>
                        <p className="text-surface-500 text-xs font-medium mb-0.5">Total de Pedidos</p>
                        <h3 className="text-xl font-display font-bold text-surface-900">1</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-surface-200 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <TrendingUp size={20} className="text-blue-500" />
                    </div>
                    <div>
                        <p className="text-surface-500 text-xs font-medium mb-0.5">Ticket Médio</p>
                        <h3 className="text-xl font-display font-bold text-surface-900">R$ 4.121,75</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-surface-200 shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Component size={20} className="text-purple-500" />
                    </div>
                    <div>
                        <p className="text-surface-500 text-xs font-medium mb-0.5">Produtos Ativos</p>
                        <h3 className="text-xl font-display font-bold text-surface-900">34</h3>
                    </div>
                </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-surface-900 mb-6">Vendas por Período</h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis
                                stroke="#71717a"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#4f46e5' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row: Status & Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-surface-900 mb-6">Pedidos por Status</h3>
                    <div className="h-[200px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={80}
                                    fill={PIE_COLOR}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLOR} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', color: '#71717a', fontSize: '12px' }} itemStyle={{ color: '#6366f1' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-surface-900 mb-6">Vendas por Categoria</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', color: '#71717a', fontSize: '12px' }} />
                                <Bar dataKey="value" fill="#6366f1" radius={[2, 2, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top 10 Products Horizontal */}
            <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-surface-900 mb-6">Top 10 Produtos Mais Vendidos</h3>
                <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={topProductsData} margin={{ top: 5, right: 20, bottom: 5, left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                            <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis type="category" dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} width={100} />
                            <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', color: '#71717a', fontSize: '12px' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row: Metas / Frete / Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm flex flex-col justify-center">
                    <h3 className="text-xs font-semibold text-surface-500 mb-2">Custo Médio de Frete</h3>
                    <div className="mt-2">
                        <h2 className="text-3xl font-display font-bold text-surface-900">R$ 89,75</h2>
                        <p className="text-xs text-surface-500 mt-1">por pedido</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm flex flex-col items-center">
                    <h3 className="text-xs font-semibold text-surface-500 w-full text-left mb-2">Faturamento por Pagamento</h3>
                    <div className="h-[100px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={paymentData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={0}
                                    outerRadius={40}
                                    fill={PIE_COLOR}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill={PIE_COLOR} />
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', color: '#71717a', fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Sales by Unit */}
            <div className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-surface-900 mb-6">Vendas por Unidade</h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={unidadeData} margin={{ top: 5, right: 0, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                            <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis
                                stroke="#71717a"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                            />
                            <Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: '8px', color: '#71717a', fontSize: '12px' }} />
                            <Bar dataKey="value" fill={BAR_COLOR_BLUE} radius={[4, 4, 0, 0]} barSize={200} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">

                {/* Clientes Mais Ativos */}
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-semibold text-surface-900 mb-4 px-1">Clientes Mais Ativos</h3>
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Cliente</th>
                                    <th className="px-6 py-4">Pedidos</th>
                                    <th className="px-6 py-4 text-right">Total Gasto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100 text-surface-700">
                                <tr className="hover:bg-surface-50 transition-colors">
                                    <td className="px-6 py-4">Five Paulista</td>
                                    <td className="px-6 py-4">1</td>
                                    <td className="px-6 py-4 text-right font-medium text-brand-600">R$ 4.121,75</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Estoque Baixo */}
                <div>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <AlertTriangle size={16} className="text-orange-500" />
                        <h3 className="text-sm font-semibold text-surface-900">Estoque Baixo (1)</h3>
                    </div>
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 text-xs font-semibold">
                                <tr>
                                    <th className="px-5 py-3">Produto</th>
                                    <th className="px-5 py-3">Estoque</th>
                                    <th className="px-5 py-3">Mínimo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100 text-surface-700">
                                <tr className="hover:bg-surface-50 transition-colors">
                                    <td className="px-5 py-3 text-xs">COPO P/ CHÁ</td>
                                    <td className="px-5 py-3 text-xs text-orange-600 font-medium">106</td>
                                    <td className="px-5 py-3 text-xs">200</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sem Estoque */}
                <div>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <XOctagon size={16} className="text-red-500" />
                        <h3 className="text-sm font-semibold text-surface-900">Sem Estoque (14)</h3>
                    </div>
                    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-surface-50 border-b border-surface-200 text-surface-500 text-xs font-semibold">
                                <tr>
                                    <th className="px-5 py-3">Produto</th>
                                    <th className="px-5 py-3">SKU</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100 text-surface-700">
                                <tr className="hover:bg-surface-50 transition-colors">
                                    <td className="px-5 py-3 text-xs">Açúcar Sache</td>
                                    <td className="px-5 py-3 text-xs font-mono text-surface-500">INS-001</td>
                                </tr>
                                <tr className="hover:bg-surface-50 transition-colors">
                                    <td className="px-5 py-3 text-xs">Avental em Couro</td>
                                    <td className="px-5 py-3 text-xs font-mono text-surface-500">UNI-012</td>
                                </tr>
                                <tr className="hover:bg-surface-50 transition-colors">
                                    <td className="px-5 py-3 text-xs">Balde</td>
                                    <td className="px-5 py-3 text-xs font-mono text-surface-500">LIM-005</td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="px-5 py-3 border-t border-surface-200 bg-surface-50 text-center">
                            <button className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                                Ver todos (14)
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
