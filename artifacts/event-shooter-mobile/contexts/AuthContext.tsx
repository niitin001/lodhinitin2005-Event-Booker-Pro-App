import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGetMeQueryKey, useGetMe, User } from '@workspace/api-client-react';
import React, { createContext, useContext, useEffect, useState } from 'react';

const TOKEN_KEY = 'eventshooter.token';
const USER_KEY = 'eventshooter.user';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([AsyncStorage.getItem(TOKEN_KEY), AsyncStorage.getItem(USER_KEY)])
      .then(([storedToken, storedUser]) => {
        if (!active) return;
        setToken(storedToken);
        setUser(storedUser ? (JSON.parse(storedUser) as User) : null);
      })
      .catch(() => {
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setIsRestoring(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const meQuery = useGetMe({
    query: {
      enabled: Boolean(token) && !isRestoring,
      retry: false,
      staleTime: 60_000,
      queryKey: getGetMeQueryKey(),
    },
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
      void AsyncStorage.setItem(USER_KEY, JSON.stringify(meQuery.data));
    }
    if (meQuery.isError && token) {
      void signOut();
    }
  }, [meQuery.data, meQuery.isError]);

  async function signIn(nextToken: string, nextUser: User) {
    setToken(nextToken);
    setUser(nextUser);
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, nextToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser)),
    ]);
  }

  async function signOut() {
    setToken(null);
    setUser(null);
    await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading: isRestoring || meQuery.isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}