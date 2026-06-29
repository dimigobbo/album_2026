import { getCatalog } from "./catalog";

/** Figurinhas com quantidade 0 (ou ausentes) no inventário do usuário. */
export function getMissing(inventory) {
  return getCatalog().filter((s) => !inventory?.[s.id]);
}

/** Figurinhas com quantidade > 1, com o campo extra "extra" = nº de repetidas. */
export function getDuplicates(inventory) {
  return getCatalog()
    .filter((s) => (inventory?.[s.id] || 0) > 1)
    .map((s) => ({ ...s, extra: inventory[s.id] - 1 }));
}

/** Agrupa uma lista de figurinhas por time, ordenado alfabeticamente. */
export function groupByTeam(stickers) {
  const groups = new Map();
  for (const s of stickers) {
    if (!groups.has(s.team)) groups.set(s.team, []);
    groups.get(s.team).push(s);
  }
  return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
}

/** Texto formatado (estilo WhatsApp, com *negrito*) para compartilhar uma lista. */
export function toShareText(stickers, title) {
  if (stickers.length === 0) return `*${title}*\n\nNenhuma figurinha nesta lista.`;
  const grouped = groupByTeam(stickers);
  let text = `*${title}*\n\n`;
  for (const [team, list] of grouped) {
    text += `*${team}*\n`;
    for (const s of list) {
      text += `• ${s.id}${s.extra ? ` (x${s.extra})` : ""} — ${s.name}\n`;
    }
    text += "\n";
  }
  return text.trim();
}

/** Gera um CSV (abre direto no Excel/Sheets) a partir de uma lista de figurinhas. */
export function toCSV(stickers) {
  const header = "codigo,nome,time,categoria,quantidade_extra\n";
  const rows = stickers
    .map((s) => `${s.id},"${s.name.replace(/"/g, '""')}",${s.team},${s.category},${s.extra ?? ""}`)
    .join("\n");
  return header + rows;
}

/** Dispara o download de um arquivo de texto no navegador. */
export function downloadFile(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Compartilha um texto usando o menu nativo de compartilhamento (Web Share
 * API) quando disponível — comum em celulares. Se não houver suporte, abre
 * o WhatsApp Web/app com o texto já preenchido como alternativa.
 */
export async function shareText(text) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ text });
      return "native";
    } catch {
      // Usuário cancelou o share nativo — cai para o fallback abaixo.
    }
  }
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
  return "whatsapp";
}

/** Copia um texto para a área de transferência. */
export async function copyText(text) {
  await navigator.clipboard.writeText(text);
}
