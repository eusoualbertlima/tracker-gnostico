import { LogIn } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

function LoginScreen({ firebaseReady }) {
  const { authError, signInWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    try {
      setSubmitting(true);
      setError('');
      await signInWithGoogle();
    } catch (loginError) {
      setError(loginError.message || 'Falha ao autenticar com Google.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="app-shell flex items-center justify-center">
      <section className="panel glass-panel screen-fade overflow-hidden px-6 py-10 text-center">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.4em] text-[var(--accent-gold)]">
            PWA Multi-Tenant
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Templo Digital</h1>
          <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
            Habit tracker gnóstico com check-ins diários, progresso em tempo real e estrutura pronta
            para uso individual ou por múltiplos usuários.
          </p>
        </div>

        <div className="rounded-[24px] border border-white/8 bg-black/20 p-5 text-left">
          <p className="text-sm font-medium text-[var(--text-primary)]">Entrar com Google</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            No primeiro login, o templo cria automaticamente uma configuração inicial de blocos e
            hábitos.
          </p>
          <button
            className="action-button mt-5 w-full justify-center py-3 text-sm font-semibold"
            disabled={!firebaseReady || submitting}
            onClick={handleLogin}
            type="button"
          >
            <LogIn size={18} />
            {submitting ? 'Conectando...' : 'Entrar com Google'}
          </button>
          {!firebaseReady ? (
            <p className="mt-4 text-sm text-amber-300">
              Preencha o arquivo `.env` com as credenciais do Firebase para habilitar o login.
            </p>
          ) : null}
          {error ? <p className="mt-4 text-sm text-[var(--danger)]">{error}</p> : null}
          {authError ? <p className="mt-4 text-sm text-[var(--danger)]">{authError}</p> : null}
        </div>
      </section>
    </main>
  );
}

export default LoginScreen;
