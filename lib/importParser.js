// Parser para importar listas do formato "Figurinhas App"
// Exemplo de linha: "MEX 🇲🇽: 3, 5, 6, 8"
// A lista contém os FALTANTES — todo o resto é marcado como possuído (qty=1).

import { getCatalog } from "./catalog";

/** Remove emojis e espaços extras de uma string. */
function stripEmojis(str) {
  return str
    .replace(/\p{Emoji_Presentation}/gu, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "") // bandeiras (regional indicators)
    .replace(/[\u{E0000}-\u{E007F}]/gu, "") // tags (bandeiras GB-ENG, GB-SCT)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Faz o parse do texto colado e retorna um mapa de inventário completo.
 *
 * Para cada seleção encontrada no texto:
 *   - Os números listados = faltantes → qty 0
 *   - Os números NÃO listados = possuídos → qty 1
 *
 * Seleções do catálogo que não aparecem no texto ficam intactas (não são
 * alteradas) — assim um import parcial não zera times que você não tinha
 * incluído na lista.
 *
 * @param {string} text  Texto colado pelo usuário
 * @param {object} currentInventory  Inventário atual do Firestore
 * @returns {{ inventory: object, stats: object, errors: string[] }}
 */
export function parseImport(text, currentInventory = {}) {
  const catalog = getCatalog();
  const errors = [];

  // Monta mapa de abreviação → set de números do catálogo, para validação
  const catalogByAbbr = new Map();
  for (const s of catalog) {
    if (!catalogByAbbr.has(s.abbreviation)) {
      catalogByAbbr.set(s.abbreviation, new Set());
    }
    catalogByAbbr.get(s.abbreviation).add(s.number);
  }

  // Parse linha a linha
  // Agrupamos linhas FWC (que podem vir quebradas em subcategorias com emojis)
  const missingByAbbr = new Map(); // abbr → Set<number> de faltantes

  for (const rawLine of text.split("\n")) {
    const line = stripEmojis(rawLine);
    if (!line || !line.includes(":")) continue;

    // Formato esperado após strip: "MEX: 3, 5, 6" ou "FWC: 1, 3, 4"
    const colonIdx = line.indexOf(":");
    const abbrRaw = line.slice(0, colonIdx).trim().toUpperCase();
    const numbersRaw = line.slice(colonIdx + 1).trim();

    // Extrai a abreviação — pega só a parte alfabética (ignora sufixos extras)
    const abbrMatch = abbrRaw.match(/^([A-Z]{2,5})/);
    if (!abbrMatch) continue;
    const abbr = abbrMatch[1];

    if (!catalogByAbbr.has(abbr)) {
      errors.push(`Abreviação não encontrada no catálogo: "${abbr}" (linha: "${line}")`);
      continue;
    }

    // Parse dos números
    const numbers = numbersRaw
      .split(",")
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n));

    if (!missingByAbbr.has(abbr)) missingByAbbr.set(abbr, new Set());
    for (const n of numbers) {
      if (!catalogByAbbr.get(abbr).has(n)) {
        errors.push(`Número ${n} não existe em ${abbr} (máx: ${catalogByAbbr.get(abbr).size})`);
      } else {
        missingByAbbr.get(abbr).add(n);
      }
    }
  }

  if (missingByAbbr.size === 0) {
    return { inventory: currentInventory, stats: null, errors: ["Nenhuma seleção reconhecida no texto."] };
  }

  // Constrói o novo inventário
  const newInventory = { ...currentInventory };
  let totalOwned = 0;
  let totalMissing = 0;
  let teamsImported = 0;

  for (const [abbr, missingSet] of missingByAbbr) {
    teamsImported++;
    const allNumbers = catalogByAbbr.get(abbr);
    for (const n of allNumbers) {
      const id = `${abbr}_${String(n).padStart(2, "0")}`;
      if (missingSet.has(n)) {
        newInventory[id] = 0;
        totalMissing++;
      } else {
        // Não estava na lista de faltantes = possuído.
        // Mantém qty atual se já for > 1 (preserva repetidas cadastradas).
        newInventory[id] = Math.max(newInventory[id] || 0, 1);
        totalOwned++;
      }
    }
  }

  return {
    inventory: newInventory,
    stats: { teamsImported, totalOwned, totalMissing },
    errors,
  };
}
