import { lazy, Suspense, useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { firebaseReady, initializeAnalytics } from './firebase.js';
import { seedDefaultHabits, seedUserProfile } from './services/habitService.js';

const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const LoginScreen = lazy(() => import('./components/LoginScreen.jsx'));
const SettingsScreen = lazy(() => import('./components/SettingsScreen.jsx'));

function ScreenLoader() {
  return (
    <main className="app-shell">
      <section className="panel glass-panel">
        <p className="p-6 text-sm text-[var(--text-muted)]">Carregando templo...</p>
      </section>
    </main>
  );
}

function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('dashboard');

  useEffect(() => {
    if (!firebaseReady) {
      return;
    }

    initializeAnalytics().catch(() => {
      console.error('Erro ao inicializar Firebase Analytics.');
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setScreen('dashboard');
      return;
    }

    Promise.all([seedDefaultHabits(user.uid), seedUserProfile(user)]).catch((error) => {
      console.error('Erro ao garantir dados iniciais do usuário:', error);
    });
  }, [user]);

  if (loading) {
    return <ScreenLoader />;
  }

  if (!user) {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <LoginScreen firebaseReady={firebaseReady} />
      </Suspense>
    );
  }

  return (
    <main className="app-shell">
      <Suspense fallback={<ScreenLoader />}>
        {screen === 'settings' ? (
          <SettingsScreen onBack={() => setScreen('dashboard')} />
        ) : (
          <Dashboard onOpenSettings={() => setScreen('settings')} />
        )}
      </Suspense>
    </main>
  );
}

export default App;
