// O catálogo mestre (data/catalog.json) é lido como um arquivo local em vez
// de uma coleção no Firestore. Motivo: é um dado de referência, idêntico
// para todos os usuários, que não muda em tempo real — então não faz
// sentido pagar leituras do Firestore (nem lidar com latência) para buscar
// ~1000 documentos que são sempre os mesmos. Isso também resolve de cara o
// requisito de "buscar por nome ou abreviação do time", porque o filtro
// roda inteiramente no cliente, sem nenhuma query.
//
// Se no futuro você quiser editar o catálogo sem fazer um novo deploy do
// site (ex: via console do Firebase), dá pra migrar só essa camada para o
// Firestore depois — o restante do app não precisa saber a diferença. Veja
// scripts/seed-firestore.mjs se quiser essa rota alternativa.

import catalogData from "@/data/catalog.json";

/** Retorna o catálogo completo (982 figurinhas: times + FWC + extras). */
export function getCatalog() {
  return catalogData;
}

/** Retorna a lista de seleções únicas, ordenada por nome. */
export function getTeams() {
  const teams = new Map();
  for (const sticker of catalogData) {
    if (sticker.category !== "Team") continue;
    if (!teams.has(sticker.abbreviation)) {
      teams.set(sticker.abbreviation, {
        team: sticker.team,
        abbreviation: sticker.abbreviation,
        group: sticker.group,
      });
    }
  }
  return Array.from(teams.values()).sort((a, b) => a.team.localeCompare(b.team, "pt-BR"));
}

/** Filtra seleções pelo nome ou pela abreviação (case-insensitive). */
export function searchTeams(query) {
  const q = query.trim().toLowerCase();
  if (!q) return getTeams();
  return getTeams().filter(
    (t) => t.team.toLowerCase().includes(q) || t.abbreviation.toLowerCase().includes(q)
  );
}

/** Todas as figurinhas de uma seleção específica (pela abreviação). */
export function getStickersByTeam(abbreviation) {
  return catalogData.filter((s) => s.abbreviation === abbreviation);
}

/** Mapa id -> figurinha, útil para lookups rápidos. */
export function getStickerMap() {
  const map = new Map();
  for (const sticker of catalogData) map.set(sticker.id, sticker);
  return map;
}
