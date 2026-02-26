import { Outlet } from 'react-router-dom';

export function AuthLayout() {
    return (
        <div className="min-h-screen bg-surface-50 flex flex-col md:flex-row">
            <div className="flex-1 flex flex-col justify-center p-8 md:p-12 lg:p-24 relative overflow-hidden">
                {/* Background Decorative Pattern */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px]" />
                    <div className="absolute top-[60%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]" />
                </div>

                <Outlet />
            </div>

            {/* Side Panel (Visible on Desktop) */}
            <div className="hidden md:flex md:w-[45%] lg:w-[50%] bg-surface-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-surface-800 to-surface-900" />
                <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-brand-500/20 blur-[100px] pointer-events-none" />

                <div className="relative z-10 text-white max-w-lg">
                    <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-brand-500/30">
                        <span className="text-3xl font-bold font-display">F</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-display font-medium mb-6 leading-tight">
                        Portal de <br />
                        <span className="text-brand-500">Suprimentos</span>
                    </h1>
                    <p className="text-surface-300 text-lg leading-relaxed">
                        Plataforma exclusiva para franqueados e parceiros da rede Five Brasil. Gerencie seus pedidos, estoque e faturamento em um só lugar.
                    </p>
                </div>
            </div>
        </div>
    );
}
