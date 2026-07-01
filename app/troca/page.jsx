"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { decodeTradePayload, crossReference } from "@/lib/tradeLink";
import { parseImport } from "@/lib/importParser";
import { getCatalog } from "@/lib/catalog";

// useSearchParams exige Suspense boundary no Next.js 14 App Router.
// Separamos a lógica em TrocaContent e envolvemos com Suspense no export default.
function TrocaContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("v");

  const myDuplicatesMap = useMemo(() => {
    if (!encoded) return null;
    return decodeTradePayload(encoded);
  }, [encoded]);

  const catalog = useMemo(() => getCatalog(), []);

  const [friendText, setFriendText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const totalDuplicates = useMemo(() => {
    if (!myDuplicatesMap) return 0;
    return Object.values(myDuplicatesMap).reduce((acc, arr) => acc + arr.length, 0);
  }, [myDuplicatesMap]);

  const handleCross = () => {
    setError(null);
    setResult(null);
    const parsed = parseImport(friendText, {});
    if (!parsed.stats) {
      setError("Não foi possível reconhecer nenhuma seleção. Verifique o formato.");
      return;
    }
    const { canGive } = crossReference(myDuplicatesMap, parsed.inventory, []);
    setResult({ canGive, friendStats: parsed.stats });
  };

  if (!encoded || !myDuplicatesMap) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-4xl">🔗</p>
        <p className="text-lg font-semibold text-stone-100 dark:text-stone-100">Link inválido ou expirado</p>
        <p className="text-sm text-stone-400">Peça um novo link para seu amigo.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 space-y-6">
      <div className="text-center">
        <p className="text-3xl mb-2">🔄</p>
        <h1 className="text-xl font-bold text-stone-100">Lista de trocas</h1>
        <p className="mt-1 text-sm text-stone-400">
          Seu amigo tem{" "}
          <span className="text-amber-400 font-semibold">{totalDuplicates} figurinhas repetidas</span>{" "}
          disponíveis para troca.
        </p>
      </div>

      <div className="rounded-xl border border-stone-700 bg-stone-900 p-4 space-y-3">
        <p className="text-sm font-medium text-stone-200">
          Cole aqui a sua lista de <span className="text-rose-400">faltantes</span> para ver o que você pode pegar:
        </p>
        <textarea
          value={friendText}
          onChange={(e) => setFriendText(e.target.value)}
          placeholder={"BRA 🇧🇷: 1, 4, 12, 13\nARG 🇦🇷: 1, 3, 5, 6\nFWC: 1, 3, 4"}
          rows={8}
          className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 focus:border-emerald-400 focus:outline-none font-mono"
        />
        {error && <p className="text-xs text-rose-400">{error}</p>}
        <button
          onClick={handleCross}
          disabled={!friendText.trim()}
          className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-40 transition"
        >
          Ver o que posso pegar →
        </button>
      </div>

      {result && (
        <div className="rounded-xl border border-stone-700 bg-stone-900 p-4 space-y-4">
          {result.canGive.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-2">😕</p>
              <p className="text-sm text-stone-400">
                Seu amigo não tem repetidas das suas faltantes.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-semibold text-stone-100">
                ✅ Você pode pegar ({result.canGive.length})
              </h2>
              <p className="text-xs text-stone-500">
                Figurinhas que seu amigo tem repetidas e você está precisando:
              </p>
              <TradeList items={result.canGive} catalog={catalog} />
            </>
          )}
        </div>
      )}

      <p className="text-center text-xs text-stone-600">
        Álbum Copa 2026 ·{" "}
        <a href="/" className="text-stone-500 hover:text-stone-400">
          Criar minha conta
        </a>
      </p>
    </div>
  );
}

function TradeList({ items, catalog }) {
  const catalogMap = useMemo(() => {
    const m = new Map();
    for (const s of catalog) m.set(s.id, s);
    return m;
  }, [catalog]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const item of items) {
      const sticker = catalogMap.get(item.id);
      const team = sticker?.team || item.abbreviation;
      if (!map.has(team)) map.set(team, []);
      map.get(team).push({ ...item, name: sticker?.name || item.id });
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [items, catalogMap]);

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {grouped.map(([team, stickers]) => (
        <div key={team}>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1">{team}</p>
          <div className="flex flex-wrap gap-1.5">
            {stickers.map((s) => (
              <span
                key={s.id}
                className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-xs font-medium text-emerald-300"
              >
                {s.abbreviation}_{String(s.number).padStart(2, "0")}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TrocaPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center text-stone-400">
            Carregando...
          </div>
        }
      >
        <TrocaContent />
      </Suspense>
    </div>
  );
}
