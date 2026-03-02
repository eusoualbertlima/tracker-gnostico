import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { auth, firebaseReady, googleProvider } from '../firebase.js';

const AuthContext = createContext(null);

function prefersRedirectAuth() {
  if (typeof window === 'undefined') {
    return false;
  }

  const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches;
  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/i.test(userAgent);

  return Boolean(isStandalone || isIOS);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(firebaseReady);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false);
      return undefined;
    }

    getRedirectResult(auth).catch((error) => {
      setAuthError(error.message || 'Falha ao autenticar com Google.');
    });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      firebaseReady,
      async signInWithGoogle() {
        if (!firebaseReady || !auth || !googleProvider) {
          throw new Error('Firebase não configurado.');
        }

        setAuthError('');

        if (prefersRedirectAuth()) {
          await signInWithRedirect(auth, googleProvider);
          return;
        }

        await signInWithPopup(auth, googleProvider);
      },
      async logout() {
        if (auth) {
          await signOut(auth);
        }
      },
    }),
    [user, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.');
  }

  return context;
}
