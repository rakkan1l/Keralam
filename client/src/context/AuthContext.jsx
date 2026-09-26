import { createContext, useCallback, useContext, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '../services/api';

const AuthContext = createContext(null);

/**
 * Session state lives in an httpOnly cookie set by the API, so the client never
 * touches the JWT. `/auth/me` tells us who is signed in.
 */
export function AuthProvider({ children }) {
  const qc = useQueryClient();
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: endpoints.me,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const login = useCallback(
    async (body) => {
      const { user: u } = await endpoints.login(body);
      qc.setQueryData(['auth', 'me'], u);
      await qc.invalidateQueries({ predicate: (q) => q.queryKey[0] === 'me' });
      return u;
    },
    [qc],
  );

  const register = useCallback(
    async (body) => {
      const { user: u } = await endpoints.register(body);
      qc.setQueryData(['auth', 'me'], u);
      return u;
    },
    [qc],
  );

  const logout = useCallback(async () => {
    await endpoints.logout();
    qc.setQueryData(['auth', 'me'], null);
    qc.removeQueries({ predicate: (q) => q.queryKey[0] === 'me' });
  }, [qc]);

  const value = useMemo(
    () => ({
      user: user || null,
      loading: isLoading,
      isAdmin: user?.role === 'admin',
      isStaff: user?.role === 'admin' || user?.role === 'editor',
      login,
      register,
      logout,
      setUser: (u) => qc.setQueryData(['auth', 'me'], u),
    }),
    [user, isLoading, login, register, logout, qc],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
