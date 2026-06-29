"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getCatalog } from "@/lib/catalog";
import {
  getMissing,
  getDuplicates,
  groupByTeam,
  toShareText,
  toCSV,
  downloadFile,
  shareText,
} from "@/lib/inventory";
import Header from "../components/Header";

export default function RelatoriosPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (snap) => setInventory(snap.data()?.inventory || {}));
  }, [user]);

  const catalog = useMemo(() => getCatalog(), []);
  const missing = useMemo(() => (inventory ? getMissing(inventory) : []), [inventory]);
  const duplicates = useMemo(() => (inventory ? getDuplicates(inventory) : []), [inventory]);

  if (loading || !inventory) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-400">
        Carregando...
      </div>
    );
  }

  const totalOwned = catalog.length - missing.length;

  return (
    <div className="pb-16">
      <Header totalOwned={totalOwned} totalStickers={catalog.length} />
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-6">
        <ReportSection
          title="Faltam"
          color="text-rose-400"
          list={missing}
          emptyText="Você já tem todas as figurinhas! 🎉"
          onExport={() => downloadFile("figurinhas-faltam.csv", toCSV(missing), "text/csv")}
          onShare={() => shareText(toShareText(missing, "Figurinhas que me faltam"))}
        />
        <ReportSection
          title="Repetidas"
          color="text-amber-400"
          list={duplicates}
          emptyText="Nenhuma repetida por enquanto."
          onExport={() => downloadFile("figurinhas-repetidas.csv", toCSV(duplicates), "text/csv")}
          onShare={() => shareText(toShareText(duplicates, "Figurinhas repetidas (tenho p/ troca)"))}
        />
      </main>
    </div>
  );
}

function ReportSection({ title, color, list, emptyText, onExport, onShare }) {
  const grouped = groupByTeam(list);

  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${color}`}>
          {title} ({list.length})
        </h2>
        {list.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={onExport}
              className="rounded-lg border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:border-stone-500"
            >
              Exportar CSV
            </button>
            <button
              onClick={onShare}
              className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-950 hover:bg-emerald-400"
            >
              Compartilhar
            </button>
          </div>
        )}
      </div>
      {list.length === 0 ? (
        <p className="text-sm text-stone-500">{emptyText}</p>
      ) : (
        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
          {grouped.map(([team, items]) => (
            <div key={team}>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{team}</p>
              <ul className="mt-1 space-y-0.5 text-sm text-stone-300">
                {items.map((s) => (
                  <li key={s.id} className="flex justify-between">
                    <span>
                      {s.id} — {s.name}
                    </span>
                    {s.extra ? <span className="text-amber-400">x{s.extra}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
