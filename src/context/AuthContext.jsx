import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, firebaseReady, googleProvider } from '../firebase.js';
import { seedDefaultHabits } from '../services/habitService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(firebaseReady);

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false);
      return undefined;
    }

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
      firebaseReady,
      async signInWithGoogle() {
        if (!firebaseReady || !auth || !googleProvider) {
          throw new Error('Firebase não configurado.');
        }

        const credential = await signInWithPopup(auth, googleProvider);
        await seedDefaultHabits(credential.user.uid);
      },
      async logout() {
        if (auth) {
          await signOut(auth);
        }
      },
    }),
    [user, loading],
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
