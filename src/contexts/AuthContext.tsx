import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'store' | 'expedition';
export type FranchiseeTier = 1 | 2 | 3;

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    storeName?: string;
    tier?: FranchiseeTier;
    cnpj?: string;
    phone?: string;
    status?: 'active' | 'pending' | 'suspended';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                if (session?.user) {
                    await fetchProfile();
                } else {
                    setUser(null);
                    setIsLoading(false);
                }
            }
        );
        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async () => {
        try {
            // Usa RPC com SECURITY DEFINER — bypassa RLS completamente
            // Sem risco de deadlock com policies recursivas
            const { data, error } = await supabase.rpc('get_my_profile');

            if (error) {
                console.error('[Auth] Erro ao buscar perfil:', error.message);
                setUser(null);
                return;
            }

            // rpc retorna array, pegamos o primeiro resultado
            const profile = Array.isArray(data) ? data[0] : data;

            if (profile) {
                setUser({
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    role: profile.role,
                    storeName: profile.store_name,
                    tier: profile.tier,
                    cnpj: profile.cnpj,
                    phone: profile.phone,
                    status: profile.status
                });
            } else {
                console.warn('[Auth] Nenhum perfil encontrado para este usuário.');
                setUser(null);
            }
        } catch (err) {
            console.error('[Auth] Erro inesperado:', err);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
