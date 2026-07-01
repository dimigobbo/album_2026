// Codifica/decodifica a lista de repetidas em um payload compacto para URL.
//
// Formato interno (antes de codificar):
//   { "BRA": [2,5,8], "ARG": [3], "FWC": [1,6] }
//
// Formato na URL (base64url do JSON comprimido):
//   ?v=eyJCUkEiOlsyLDUsOF0sIkFSRyI6WzNdLCJGV0MiOlsxLDZdfQ
//
// Optamos por JSON + base64url (sem lib de compressão) porque o payload
// máximo (~48 times × ~10 repetidas em média) fica em ~600 bytes de JSON,
// o que vira ~800 chars de base64 — bem dentro do limite de URLs.

import { getDuplicates } from "./inventory";

/**
 * Gera a URL de trocas com as repetidas do usuário embutidas.
 * @param {object} inventory  inventário do Firestore
 * @param {string} baseUrl    ex: "https://dgobbo.vercel.app"
 */
export function buildTradeUrl(inventory, baseUrl) {
  const duplicates = getDuplicates(inventory);

  // Agrupa por abreviação → lista de números
  const map = {};
  for (const s of duplicates) {
    if (!map[s.abbreviation]) map[s.abbreviation] = [];
    map[s.abbreviation].push(s.number);
  }

  const json = JSON.stringify(map);
  // btoa não existe no Node/Edge — usar Buffer no servidor, btoa no browser.
  // Como essa função só é chamada no browser (componente client), btoa é seguro.
  const encoded = btoa(unescape(encodeURIComponent(json)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${baseUrl}/troca?v=${encoded}`;
}

/**
 * Decodifica o parâmetro `v` da URL de volta para o mapa de repetidas.
 * Retorna null se inválido.
 */
export function decodeTradePayload(encoded) {
  try {
    const json = decodeURIComponent(
      escape(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")))
    );
    const map = JSON.parse(json);
    // Validação básica: deve ser um objeto com arrays de números
    if (typeof map !== "object" || Array.isArray(map)) return null;
    return map;
  } catch {
    return null;
  }
}

/**
 * Cruza as repetidas de quem gerou o link com os faltantes do amigo.
 *
 * @param {object} myDuplicatesMap   { "BRA": [2,5], ... }  — do payload da URL
 * @param {object} friendMissing     { "BRA_02": true, ... } — parsed da lista colada
 * @returns {{ canGive: Sticker[], canReceive: Sticker[] }}
 *   canGive    = minhas repetidas que o amigo precisa
 *   canReceive = faltantes minhas que o amigo tem repetidas (só se ele colar as próprias repetidas)
 */
export function crossReference(myDuplicatesMap, friendInventory, myCatalogMissing) {
  const canGive = [];
  const canReceive = [];

  // O que posso DAR: minha repetida que o amigo não tem (qty 0 ou ausente)
  for (const [abbr, numbers] of Object.entries(myDuplicatesMap)) {
    for (const n of numbers) {
      const id = `${abbr}_${String(n).padStart(2, "0")}`;
      const friendQty = friendInventory[id] || 0;
      if (friendQty === 0) {
        canGive.push({ id, abbreviation: abbr, number: n });
      }
    }
  }

  // O que posso PEDIR: minha faltante que o amigo tem repetida (qty > 1)
  for (const id of myCatalogMissing) {
    const friendQty = friendInventory[id] || 0;
    if (friendQty > 1) {
      const [abbr, numStr] = id.split("_");
      canReceive.push({ id, abbreviation: abbr, number: parseInt(numStr, 10) });
    }
  }

  return { canGive, canReceive };
}
