import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import React from 'react';

export function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { user, isLoading: isAuthLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) {
                if (authError.message === 'Invalid login credentials') {
                    throw new Error('E-mail ou senha incorretos.');
                }
                throw authError;
            }

            // Navigation happens via the useEffect below once `user` is set by AuthContext
        } catch (err: any) {
            setError(err.message || 'Credenciais inválidas. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Wait until AuthContext finishes loading the profile before redirecting.
    React.useEffect(() => {
        if (isAuthLoading || !user) return;

        // Block non-active users
        if (user.status === 'pending') {
            supabase.auth.signOut();
            setError('Seu cadastro ainda está aguardando aprovação. Você será notificado quando for aprovado.');
            return;
        }
        if (user.status === 'suspended') {
            supabase.auth.signOut();
            setError('Sua conta foi suspensa. Entre em contato com o suporte.');
            return;
        }

        // Active users — redirect based on role
        if (user.role === 'admin' || user.role === 'expedition') {
            navigate('/admin');
        } else {
            navigate('/store');
        }
    }, [user, isAuthLoading, navigate]);

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="mb-10 lg:hidden flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                    <span className="text-white text-xl font-bold font-display">F</span>
                </div>
                <span className="text-xl font-display font-medium text-surface-900">Five Store</span>
            </div>

            <div className="mb-8">
                <h2 className="text-3xl font-display font-semibold text-surface-900 mb-3">Bem-vindo de volta</h2>
                <p className="text-surface-500">Insira suas credenciais para acessar sua conta.</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1.5" htmlFor="email">
                            E-mail
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                <Mail size={20} />
                            </div>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="seunome@exemplo.com"
                                className="block w-full pl-10 pr-3 py-2.5 border border-surface-200 rounded-xl bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-sm font-medium text-surface-700" htmlFor="password">
                                Senha
                            </label>
                            <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                                Esqueceu a senha?
                            </a>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                                <Lock size={20} />
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                    className="w-full btn-primary flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <>
                            Entrar na plataforma
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-surface-200"></div>
                    <span className="flex-shrink-0 mx-4 text-surface-400 text-sm">Novo na Five?</span>
                    <div className="flex-grow border-t border-surface-200"></div>
                </div>

                <Link
                    to="/register"
                    className="w-full btn-secondary flex justify-center items-center"
                >
                    Solicitar acesso como franqueado
                </Link>
            </form>
        </div>
    );
}
