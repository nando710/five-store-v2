import { useState } from 'react';
import {
    User,
    Building2,
    MapPin,
    Mail,
    Phone,
    ShieldCheck,
    Save,
    Camera
} from 'lucide-react';

export function Profile() {
    // Form state (mocked)
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000); // Simulate API call
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12 pt-4">

            {/* Header section with cover and avatar */}
            <div className="bg-white rounded-3xl border border-surface-200 overflow-hidden shadow-sm">
                <div className="h-32 sm:h-48 bg-gradient-to-r from-brand-600 to-purple-600 relative">
                    {/* Add cover photo button */}
                    <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-2">
                        <Camera size={14} />
                        Alterar Capa
                    </button>
                </div>

                <div className="px-6 sm:px-10 pb-8 relative">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-12 sm:-mt-16 mb-4">
                        <div className="relative">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-brand-100 flex items-center justify-center text-brand-600 text-4xl font-bold shadow-lg">
                                P
                            </div>
                            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-surface-200 shadow-sm flex items-center justify-center text-surface-600 hover:text-brand-600 transition-colors">
                                <Camera size={14} />
                            </button>
                        </div>

                        <div className="text-center sm:text-left flex-1">
                            <h1 className="text-2xl font-display font-bold text-surface-900">Five Paulista</h1>
                            <p className="text-sm text-surface-500 flex items-center justify-center sm:justify-start gap-1 font-medium mt-1">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                Franqueado Verificado
                            </p>
                        </div>

                        <div className="w-full sm:w-auto">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-brand-500/20 active:scale-[0.98] disabled:opacity-75"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Salvar Alterações
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (Personal Info & Business Info) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Informações da Franquia */}
                    <div className="bg-white rounded-3xl border border-surface-200 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-surface-900">Informações da Franquia</h2>
                                <p className="text-xs text-surface-500">Dados fiscais e identificação da loja</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-semibold text-surface-700">Nome da Unidade</label>
                                <input
                                    type="text"
                                    defaultValue="Five Paulista"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-surface-700">Razão Social</label>
                                <input
                                    type="text"
                                    defaultValue="Five Paulista Comércio de Alimentos LTDA"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-surface-700">CNPJ</label>
                                <input
                                    type="text"
                                    defaultValue="00.000.000/0001-00"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm font-mono text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-semibold text-surface-700">Inscrição Estadual</label>
                                <input
                                    type="text"
                                    defaultValue="123.456.789.012"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm font-mono text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-white rounded-3xl border border-surface-200 p-6 sm:p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-surface-900">Endereço de Entrega principal</h2>
                                <p className="text-xs text-surface-500">Local onde os insumos serão enviados</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-semibold text-surface-700">CEP</label>
                                <input
                                    type="text"
                                    defaultValue="01310-100"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-4">
                                <label className="text-xs font-semibold text-surface-700">Endereço</label>
                                <input
                                    type="text"
                                    defaultValue="Avenida Paulista"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none cursor-not-allowed text-surface-500"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-semibold text-surface-700">Número</label>
                                <input
                                    type="text"
                                    defaultValue="1000"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-4">
                                <label className="text-xs font-semibold text-surface-700">Complemento / Ponto de Referência</label>
                                <input
                                    type="text"
                                    defaultValue="Loja Térreo - Próximo ao Metrô"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-3">
                                <label className="text-xs font-semibold text-surface-700">Bairro</label>
                                <input
                                    type="text"
                                    defaultValue="Bela Vista"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 bg-surface-100 outline-none cursor-not-allowed text-surface-500"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-xs font-semibold text-surface-700">Cidade</label>
                                <input
                                    type="text"
                                    defaultValue="São Paulo"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 bg-surface-100 outline-none cursor-not-allowed text-surface-500"
                                    readOnly
                                />
                            </div>
                            <div className="space-y-1.5 md:col-span-1">
                                <label className="text-xs font-semibold text-surface-700">UF</label>
                                <input
                                    type="text"
                                    defaultValue="SP"
                                    className="w-full bg-surface-50 border border-surface-200 rounded-xl px-4 py-2.5 text-sm text-surface-900 bg-surface-100 outline-none cursor-not-allowed text-surface-500"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (User settings & Security) */}
                <div className="space-y-6">
                    {/* Responsável */}
                    <div className="bg-white rounded-3xl border border-surface-200 p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <User size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-surface-900">Responsável</h2>
                                <p className="text-xs text-surface-500">Administrador da conta</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-surface-700">Nome Completo</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={16} className="text-surface-400" />
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue="João Silva"
                                        className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-surface-700">E-mail</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail size={16} className="text-surface-400" />
                                    </div>
                                    <input
                                        type="email"
                                        defaultValue="joao.silva@fivestore.com.br"
                                        className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-surface-700">Celular / WhatsApp</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone size={16} className="text-surface-400" />
                                    </div>
                                    <input
                                        type="text"
                                        defaultValue="(11) 98765-4321"
                                        className="w-full bg-surface-50 border border-surface-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-surface-900 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
