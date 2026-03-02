const EGO_PATTERNS = [
  {
    id: 'orgulho',
    label: 'Orgulho',
    keywords: ['orgulho', 'superior', 'razão', 'teimos', 'controle', 'impor', 'defender minha imagem'],
    summary: 'necessidade de se afirmar, controlar ou preservar superioridade',
    practice: 'Observe a necessidade de ter razão e pratique humildade consciente.',
  },
  {
    id: 'ira',
    label: 'Ira',
    keywords: ['raiva', 'ira', 'irrit', 'explodi', 'ressent', 'agress', 'impacien'],
    summary: 'reação quente, fricção e descarga emocional',
    practice: 'Revise o gatilho, respire antes da resposta e observe a reação no corpo.',
  },
  {
    id: 'preguica',
    label: 'Preguiça',
    keywords: ['pregui', 'adiei', 'procrast', 'comodismo', 'evitei', 'enrolei', 'dispers'],
    summary: 'fuga do esforço necessário ou dispersão da energia',
    practice: 'Quebre a ação em um próximo passo concreto e ataque primeiro o essencial.',
  },
  {
    id: 'medo',
    label: 'Medo',
    keywords: ['medo', 'insegur', 'ansios', 'hesitei', 'receio', 'travei', 'evitei confronto'],
    summary: 'retração, autoproteção e hesitação diante do dever',
    practice: 'Nomeie o risco real e aja em uma versão menor, porém objetiva, do dever.',
  },
  {
    id: 'vaidade',
    label: 'Vaidade',
    keywords: ['aprovação', 'aplaus', 'reconhecimento', 'imagem', 'status', 'parecer', 'admiração'],
    summary: 'busca de validação, imagem e reconhecimento externo',
    practice: 'Pergunte se a ação buscava verdade ou validação.',
  },
  {
    id: 'inveja',
    label: 'Inveja',
    keywords: ['inveja', 'comparei', 'comparação', 'ciúme', 'ciume', 'sucesso alheio'],
    summary: 'comparação dolorosa e resistência ao bem do outro',
    practice: 'Converta comparação em referência prática e agradeça o próprio caminho.',
  },
  {
    id: 'gula_compulsao',
    label: 'Gula e Compulsão',
    keywords: ['compuls', 'exagerei', 'comi demais', 'impulso', 'descontrole', 'ansiedade na comida'],
    summary: 'busca de alívio imediato por excesso ou impulso',
    practice: 'Observe a carência que antecedeu o impulso e substitua por pausa consciente.',
  },
  {
    id: 'vitimismo',
    label: 'Vitimismo',
    keywords: ['culpei', 'injustiçado', 'me colocaram', 'vítima', 'vitima', 'ninguém me entende'],
    summary: 'tendência a deslocar responsabilidade e fixar-se na dor pessoal',
    practice: 'Recupere a parcela de responsabilidade que ainda está sob seu comando.',
  },
];

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function splitSentences(text) {
  return text
    .split(/[\n.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function getIntensity(score) {
  if (score >= 5) {
    return 'alta';
  }

  if (score >= 3) {
    return 'media';
  }

  return 'leve';
}

export function analyzeRetrospective(text) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return {
      summary: 'Sem retrospectiva registrada.',
      disclaimer: 'A leitura simbólica aparece quando houver texto suficiente para observar padrões.',
      egos: [],
    };
  }

  const normalizedText = normalizeText(trimmedText);
  const sentences = splitSentences(trimmedText);

  const egos = EGO_PATTERNS.map((pattern) => {
    const evidence = [];
    let score = 0;

    for (const sentence of sentences) {
      const normalizedSentence = normalizeText(sentence);
      const hits = pattern.keywords.filter((keyword) => normalizedSentence.includes(keyword)).length;

      if (hits > 0) {
        score += hits;
        evidence.push(sentence);
      }
    }

    if (!score && pattern.keywords.some((keyword) => normalizedText.includes(keyword))) {
      score = 1;
    }

    return {
      id: pattern.id,
      label: pattern.label,
      summary: pattern.summary,
      practice: pattern.practice,
      score,
      intensity: getIntensity(score),
      evidence: evidence.slice(0, 2),
    };
  })
    .filter((pattern) => pattern.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  if (!egos.length) {
    return {
      summary: 'Texto salvo. Ainda sem sinais fortes por palavras-chave de ego.',
      disclaimer: 'Essa leitura é heurística e simbólica; quanto mais concreto o relato, melhor a leitura.',
      egos: [],
    };
  }

  return {
    summary: `Padrões mais evidentes no texto: ${egos.map((ego) => ego.label).join(', ')}.`,
    disclaimer: 'Leitura heurística baseada no texto escrito; use como espelho de auto-observação, não como diagnóstico.',
    egos,
  };
}
