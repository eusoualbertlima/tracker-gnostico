import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import SettingsScreen from './components/SettingsScreen.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { seedDefaultHabits } from './services/habitService.js';

function App() {
  const { user, loading, firebaseReady } = useAuth();
  const [screen, setScreen] = useState('dashboard');

  useEffect(() => {
    if (!user) {
      setScreen('dashboard');
      return;
    }

    seedDefaultHabits(user.uid).catch((error) => {
      console.error('Erro ao garantir seed de hábitos:', error);
    });
  }, [user]);

  if (loading) {
    return (
      <main className="app-shell">
        <section className="panel glass-panel">
          <p className="p-6 text-sm text-[var(--text-muted)]">Carregando templo...</p>
        </section>
      </main>
    );
  }

  if (!user) {
    return <LoginScreen firebaseReady={firebaseReady} />;
  }

  return (
    <main className="app-shell">
      {screen === 'settings' ? (
        <SettingsScreen onBack={() => setScreen('dashboard')} />
      ) : (
        <Dashboard onOpenSettings={() => setScreen('settings')} />
      )}
    </main>
  );
}

export default App;
