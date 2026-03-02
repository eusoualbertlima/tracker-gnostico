# Templo Digital

Habit tracker gnóstico em React + Vite + Firebase.

Cada usuário autenticado recebe:

- um perfil próprio do templo (`displayName`, `templeName`, `mantra`)
- uma configuração inicial de blocos e hábitos
- documentos diários com progresso e streak
- analytics habilitado quando `measurementId` estiver configurado

## Rodar localmente

```bash
npm install
npm run dev
```

App local:

```txt
http://127.0.0.1:5173
```

Preview local do build:

```bash
npm run build
npm run preview
```

Preview:

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
VITE_FIREBASE_MEASUREMENT_ID=
```

### Checklist mínimo no console

1. Crie o projeto Firebase.
2. Em `Authentication > Sign-in method`, habilite `Google`.
3. Em `Authentication > Settings > Authorized domains`, confirme `localhost`.
4. Crie o `Firestore Database` em modo nativo.
5. Publique as regras de [`firestore.rules`](./firestore.rules).

## Regras do Firestore

Use o arquivo [`firestore.rules`](./firestore.rules).

## Deploy com Firebase Hosting

Arquivos já incluídos no repo:

- `firebase.json` com rewrite para SPA e publicação do `dist`
- `.firebaserc.example` como modelo de projeto
- `firestore.rules` para autenticação por `uid`

Passos:

```bash
cp .firebaserc.example .firebaserc
```

Edite o `default` da `.firebaserc` com o `projectId` do Firebase e depois execute:

```bash
npm install
npm run firebase:login
npm run deploy
```

Depois do deploy:

1. Adicione o domínio publicado em `Authentication > Settings > Authorized domains`.
2. Teste login Google no navegador e no modo PWA instalado.

## Validação do MVP

1. Abra o app local.
2. Clique em `Entrar com Google`.
3. Após login, confirme se a seed criou `users/{uid}/config/profile`.
4. Confirme se a seed criou `users/{uid}/config/habits`.
5. Confirme se o dia atual criou `users/{uid}/days/{YYYY-MM-DD}`.
6. Marque hábitos e veja se `progress` muda em tempo real.
7. Edite nome exibido, nome do templo e mantra em `Configurações`.
8. Abra em duas abas para validar sincronização.
9. Em iPhone/iPad ou PWA instalado, confirme que o fluxo de login usa redirecionamento e conclui com sucesso.
