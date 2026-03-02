import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; email: string; role: 'admin' | 'user' } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = async (userId: string): Promise<'admin' | 'user'> => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const roles = data?.map((r: any) => r.role) || [];
    return roles.includes('admin') ? 'admin' : 'user';
  };

  useEffect(() => {
    let mounted = true;

    // Use onAuthStateChange which handles INITIAL_SESSION automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        // Use setTimeout to avoid Supabase auth deadlock
        setTimeout(async () => {
          if (!mounted) return;
          try {
            const role = await fetchRole(session.user.id);
            if (mounted) {
              setUser({ id: session.user.id, email: session.user.email!, role });
              setLoading(false);
            }
          } catch {
            if (mounted) {
              setUser({ id: session.user.id, email: session.user.email!, role: 'user' });
              setLoading(false);
            }
          }
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
