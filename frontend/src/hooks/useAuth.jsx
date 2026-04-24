import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getUser());

  useEffect(() => {
    const handler = () => setUser(null);
    window.addEventListener('eraldo:logout', handler);
    return () => window.removeEventListener('eraldo:logout', handler);
  }, []);

  const login = async (email, senha) => {
    const u = await auth.login(email, senha);
    setUser(u);
    return u;
  };

  const logout = () => {
    auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
