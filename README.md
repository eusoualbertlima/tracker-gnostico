# Templo Digital

Habit tracker gnóstico em React + Vite + Firebase.

## Rodar localmente

```bash
npm install
npm run dev
```

App local:

```txt
http://127.0.0.1:4173
```

## Firebase

Preencha o arquivo `.env` na raiz com:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Checklist mínimo no console

1. Crie o projeto Firebase.
2. Em `Authentication > Sign-in method`, habilite `Google`.
3. Em `Authentication > Settings > Authorized domains`, confirme `localhost`.
4. Crie o `Firestore Database` em modo nativo.
5. Publique as regras de [firestore.rules](C:/Users/Albert%20Lima/Dev/tracker-gnostico/firestore.rules).

## Regras do Firestore

Use o arquivo [firestore.rules](C:/Users/Albert%20Lima/Dev/tracker-gnostico/firestore.rules).

## Validação do MVP

1. Abra o app local.
2. Clique em `Entrar com Google`.
3. Após login, confirme se a seed criou `users/{uid}/config/habits`.
4. Confirme se o dia atual criou `users/{uid}/days/{YYYY-MM-DD}`.
5. Marque hábitos e veja se `progress` muda em tempo real.
6. Abra em duas abas para validar sincronização.
