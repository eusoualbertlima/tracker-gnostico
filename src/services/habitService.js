import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { format, isSameDay, parseISO, subDays } from 'date-fns';
import { db, firebaseReady } from '../firebase.js';

export const DEFAULT_BLOCKS = [
  {
    id: 'fundacao',
    icon: '⚡',
    title: 'A Fundação',
    order: 1,
    habits: [
      { id: 'raom_gaom', label: 'Despertar imóvel + Mantra RAOM GAOM', time: '04:00' },
      { id: 'auto_obs', label: 'Auto-observação (Morte em Marcha do Orgulho)', time: 'Dia todo' },
      { id: 'silencio', label: 'Silêncio Hermético ("Faça e nada diga")', time: 'Dia todo' },
      { id: 'higiene', label: 'Jantar leve + Conjuração KLIM-KRISHNAYA', time: '20:00' },
    ],
  },
  {
    id: 'milagre_manha',
    icon: '🌅',
    title: 'O Milagre da Manhã',
    order: 2,
    habits: [
      { id: 'oracao', label: 'Leitura / Oração / Meditação', time: '04:05' },
      { id: 'treino', label: 'Treino Pesado (Transmutação)', time: '05:00' },
    ],
  },
  {
    id: 'campo_batalha',
    icon: '🚀',
    title: 'O Campo de Batalha',
    order: 3,
    habits: [
      { id: 'deep_work', label: 'Deep Work no SaaS/Ativo Próprio', time: '07:00' },
      { id: 'chatgeniuns', label: 'Suporte e Vendas (ChatGeniuns)', time: '08:00' },
      { id: 'sacrificio', label: 'Sacrifício (Dharma): Ajudei alguém hoje?', time: 'Dia todo' },
    ],
  },
  {
    id: 'ativo_principal',
    icon: '💰',
    title: 'O Ativo Principal',
    order: 4,
    habits: [
      { id: 'infra_meta', label: 'Infra Própria / Lançamentos (Lucas Batt)', time: '18:00' },
    ],
  },
  {
    id: 'fechamento',
    icon: '🌙',
    title: 'Fechamento',
    order: 5,
    habits: [
      { id: 'kanban', label: 'Kanban atualizado para o dia seguinte', time: '20:00' },
      { id: 'retrospectiva', label: 'Retrospectiva: "Onde agi com ego hoje?"', time: '20:30' },
    ],
  },
];

function requireDb() {
  if (!firebaseReady || !db) {
    throw new Error('Firebase não configurado.');
  }
}

function getConfigRef(uid) {
  return doc(db, 'users', uid, 'config', 'habits');
}

function getDayRef(uid, dateKey) {
  return doc(db, 'users', uid, 'days', dateKey);
}

export function getTodayKey() {
  return format(new Date(), 'yyyy-MM-dd');
}

export function normalizeBlocks(blocks = []) {
  return [...blocks].sort((a, b) => a.order - b.order);
}

export function flattenHabits(blocks = []) {
  return blocks.flatMap((block) =>
    (block.habits ?? []).map((habit) => ({
      ...habit,
      blockId: block.id,
    })),
  );
}

function buildDayPayload(dateKey, blocks) {
  const habits = flattenHabits(blocks).reduce((accumulator, habit) => {
    accumulator[habit.id] = false;
    return accumulator;
  }, {});

  return {
    date: dateKey,
    habits,
    progress: 0,
    updatedAt: serverTimestamp(),
  };
}

export async function getHabitConfig(uid) {
  requireDb();
  const snapshot = await getDoc(getConfigRef(uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export function subscribeHabitConfig(uid, callback) {
  requireDb();
  return onSnapshot(getConfigRef(uid), (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null);
  });
}

export async function seedDefaultHabits(uid) {
  requireDb();
  const configRef = getConfigRef(uid);
  const snapshot = await getDoc(configRef);

  if (snapshot.exists()) {
    return snapshot.data();
  }

  const payload = {
    blocks: DEFAULT_BLOCKS,
    updatedAt: serverTimestamp(),
  };

  await setDoc(configRef, payload);
  return payload;
}

export async function ensureDayDocument(uid, dateKey, blocks) {
  requireDb();
  const dayRef = getDayRef(uid, dateKey);
  const snapshot = await getDoc(dayRef);

  if (snapshot.exists()) {
    return snapshot.data();
  }

  const payload = buildDayPayload(dateKey, blocks);
  await setDoc(dayRef, payload, { merge: true });
  return payload;
}

export function subscribeDay(uid, dateKey, callback) {
  requireDb();
  return onSnapshot(getDayRef(uid, dateKey), (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() : null);
  });
}

export async function toggleHabit(uid, dateKey, habitId) {
  requireDb();

  await runTransaction(db, async (transaction) => {
    const configRef = getConfigRef(uid);
    const dayRef = getDayRef(uid, dateKey);
    const [configSnapshot, daySnapshot] = await Promise.all([
      transaction.get(configRef),
      transaction.get(dayRef),
    ]);

    if (!configSnapshot.exists()) {
      throw new Error('Configuração de hábitos não encontrada.');
    }

    const blocks = normalizeBlocks(configSnapshot.data().blocks ?? []);
    const totalHabits = flattenHabits(blocks).length;
    const currentDay = daySnapshot.exists() ? daySnapshot.data() : buildDayPayload(dateKey, blocks);
    const nextHabits = {
      ...(currentDay.habits ?? {}),
      [habitId]: !(currentDay.habits?.[habitId] ?? false),
    };
    const checkedCount = Object.values(nextHabits).filter(Boolean).length;
    const progress = totalHabits ? Math.round((checkedCount / totalHabits) * 100) : 0;

    transaction.set(
      dayRef,
      {
        date: dateKey,
        habits: nextHabits,
        progress,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });
}

async function mutateBlocks(uid, mutator) {
  requireDb();

  const configRef = getConfigRef(uid);
  const current = (await getHabitConfig(uid)) ?? (await seedDefaultHabits(uid));
  const nextBlocks = normalizeBlocks(mutator(structuredClone(current.blocks ?? [])));

  await updateDoc(configRef, {
    blocks: nextBlocks,
    updatedAt: serverTimestamp(),
  });

  const todayKey = getTodayKey();
  const todayRef = getDayRef(uid, todayKey);
  const todaySnapshot = await getDoc(todayRef);

  if (!todaySnapshot.exists()) {
    return;
  }

  const currentDay = todaySnapshot.data();
  const allowedHabitIds = new Set(flattenHabits(nextBlocks).map((habit) => habit.id));
  const nextHabits = {};

  for (const habitId of allowedHabitIds) {
    nextHabits[habitId] = currentDay.habits?.[habitId] ?? false;
  }

  const checkedCount = Object.values(nextHabits).filter(Boolean).length;
  const progress = allowedHabitIds.size ? Math.round((checkedCount / allowedHabitIds.size) * 100) : 0;

  await setDoc(
    todayRef,
    {
      date: todayKey,
      habits: nextHabits,
      progress,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function addBlock(uid, block) {
  await mutateBlocks(uid, (blocks) => {
    blocks.push({
      ...block,
      habits: [],
      order: blocks.length + 1,
    });
    return blocks;
  });
}

export async function updateBlock(uid, blockId, data) {
  await mutateBlocks(uid, (blocks) =>
    blocks.map((block) => (block.id === blockId ? { ...block, ...data } : block)),
  );
}

export async function deleteBlock(uid, blockId) {
  await mutateBlocks(uid, (blocks) =>
    blocks
      .filter((block) => block.id !== blockId)
      .map((block, index) => ({ ...block, order: index + 1 })),
  );
}

export async function addHabit(uid, blockId, habit) {
  await mutateBlocks(uid, (blocks) =>
    blocks.map((block) =>
      block.id === blockId
        ? { ...block, habits: [...(block.habits ?? []), habit] }
        : block,
    ),
  );
}

export async function updateHabit(uid, blockId, habitId, data) {
  await mutateBlocks(uid, (blocks) =>
    blocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            habits: (block.habits ?? []).map((habit) =>
              habit.id === habitId ? { ...habit, ...data } : habit,
            ),
          }
        : block,
    ),
  );
}

export async function deleteHabit(uid, blockId, habitId) {
  await mutateBlocks(uid, (blocks) =>
    blocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            habits: (block.habits ?? []).filter((habit) => habit.id !== habitId),
          }
        : block,
    ),
  );
}

export function subscribeStreak(uid, callback) {
  requireDb();
  const daysRef = collection(db, 'users', uid, 'days');
  return onSnapshot(query(daysRef, orderBy('date', 'desc')), (snapshot) => {
    let streak = 0;
    let expectedDate = null;

    for (const item of snapshot.docs) {
      const data = item.data();
      if (!data.date) {
        break;
      }

      const currentDate = parseISO(data.date);

      if (!expectedDate) {
        expectedDate = currentDate;
      }

      if (!isSameDay(currentDate, expectedDate) || (data.progress ?? 0) < 80) {
        break;
      }

      streak += 1;
      expectedDate = subDays(expectedDate, 1);
    }

    callback(streak);
  });
}

export function createId(value) {
  const sanitized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');

  return sanitized || crypto.randomUUID().slice(0, 8);
}
