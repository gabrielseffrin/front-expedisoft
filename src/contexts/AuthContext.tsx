import { createContext, type ReactNode, useEffect, useState } from 'react';
import { authService } from '@/services/auth.service';

interface User {
    id: string;
    name: string;
    email: string;
    rule: string;
}

interface AuthContextType {
    signed: boolean;
    user: User | null;
    loading: boolean;
    signIn: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            const storedToken = localStorage.getItem("token");

            if (storedToken) {
                try {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error(error);
                    localStorage.removeItem("token");
                    setUser(null);
                }
            }
            setLoading(false);
        }

        loadStorageData();
    }, []);

    async function signIn(token: string) {
        localStorage.setItem('token', token);
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
            throw error;
        }
    }

    async function signOut() {

        try {
            await authService.logout();
        } catch (error) {
            console.error("Erro ao fazer logout na API:", error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    }

    return (
        <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}