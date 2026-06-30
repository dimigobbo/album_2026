import catalogData from "@/data/catalog.json";

/** Remove acentos e normaliza para comparação (ex: "Bósnia" → "bosnia"). */
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

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

/** Filtra seleções pelo nome ou abreviação, ignorando acentos e maiúsculas. */
export function searchTeams(query) {
  const q = normalize(query.trim());
  if (!q) return getTeams();
  return getTeams().filter(
    (t) => normalize(t.team).includes(q) || normalize(t.abbreviation).includes(q)
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
