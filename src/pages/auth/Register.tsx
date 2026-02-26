import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Store, ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        storeName: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setIsLoading(true);

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        name: formData.fullName,
                        store_name: formData.storeName,
                    }
                }
            });

            if (signUpError) throw signUpError;

            alert('Cadastro solicitado com sucesso! Você já pode tentar acessar a plataforma (sujeito a aprovação).');
            navigate('/login');
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar o cadastro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-8">
                <Link to="/login" className="inline-flex items-center text-sm font-medium text-surface-500 hover:text-surface-900 transition-colors mb-6">
                    <ArrowLeft size={16} className="mr-1" /> Voltar para o login
                </Link>
                <h2 className="text-3xl font-display font-semibold text-surface-900 mb-2">Solicitar Acesso</h2>
                <p className="text-surface-500">Preencha os dados abaixo para se cadastrar como franqueado da rede.</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">

                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5" htmlFor="fullName">
                        Nome Completo
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                            <User size={20} />
                        </div>
                        <input
                            id="fullName"
                            type="text"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            placeholder="João da Silva"
                            className="block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5" htmlFor="storeName">
                        Nome da Unidade / Franquia
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                            <Store size={20} />
                        </div>
                        <input
                            id="storeName"
                            type="text"
                            value={formData.storeName}
                            onChange={handleChange}
                            required
                            placeholder="Five Store - Centro"
                            className="block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1.5" htmlFor="email">
                        E-mail Profissional
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                            <Mail size={20} />
                        </div>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="joao@fivestore.com.br"
                            className="block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5" htmlFor="password">
                            Senha
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                <Lock size={20} />
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5" htmlFor="confirmPassword">
                            Confirmar Senha
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                <Lock size={20} />
                            </div>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full btn-primary flex justify-center items-center gap-2 group mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            Enviar Solicitação
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                <p className="text-center text-sm text-surface-500 mt-4">
                    Ao solicitar o acesso, você concorda com nossos <br />
                    <a href="#" className="text-brand-600 hover:underline">Termos de Serviço</a> e <a href="#" className="text-brand-600 hover:underline">Política de Privacidade</a>.
                </p>
            </form>
        </div>
    );
}
