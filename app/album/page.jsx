"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getCatalog, getTeams } from "@/lib/catalog";
import Header from "../components/Header";
import TeamSection from "../components/TeamSection";
import ImportModal from "../components/ImportModal";

export default function AlbumPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = useState(null);
  const [search, setSearch] = useState("");
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(ref, (snap) => {
      setInventory(snap.data()?.inventory || {});
    });
    return unsubscribe;
  }, [user]);

  const catalog = useMemo(() => getCatalog(), []);
  const teams = useMemo(() => getTeams(), []);
  const fwc = useMemo(() => catalog.filter((s) => s.category === "FWC"), [catalog]);
  const extra = useMemo(() => catalog.filter((s) => s.category === "Extra"), [catalog]);

  const filteredTeams = useMemo(() => {
    const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const q = normalize(search.trim());
    if (!q) return teams;
    return teams.filter(
      (t) => normalize(t.team).includes(q) || normalize(t.abbreviation).includes(q)
    );
  }, [teams, search]);

  const updateQty = async (code, qty) => {
    if (!user) return;
    setInventory((prev) => ({ ...prev, [code]: qty }));
    const { updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, "users", user.uid), { [`inventory.${code}`]: qty });
  };

  const handleIncrement = (code, current) => updateQty(code, current + 1);
  const handleDecrement = (code, current) => updateQty(code, Math.max(0, current - 1));

  // Grava o inventário completo de uma vez (usado na importação)
  const handleImportConfirm = async (newInventory) => {
    if (!user) return;
    setInventory(newInventory);
    await setDoc(
      doc(db, "users", user.uid),
      { inventory: newInventory },
      { merge: true }
    );
  };

  if (loading || !inventory) {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-400">
        Carregando álbum...
      </div>
    );
  }

  const totalOwned = catalog.filter((s) => (inventory[s.id] || 0) > 0).length;

  return (
    <div className="pb-16">
      <Header totalOwned={totalOwned} totalStickers={catalog.length} />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">

        {/* Barra de busca + botão de importação */}
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar seleção (ex: Brasil ou BRA)"
            className="flex-1 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-sm placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none"
          />
          <button
            onClick={() => setShowImport(true)}
            className="rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-sm text-stone-400 hover:border-emerald-400 hover:text-emerald-400 transition"
            title="Importar lista de outro app"
          >
            ⬇ Importar
          </button>
        </div>

        {!search && (
          <TeamSection
            title="Mundial"
            subtitle="FWC"
            stickers={fwc}
            inventory={inventory}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        )}

        {filteredTeams.map((t) => (
          <TeamSection
            key={t.abbreviation}
            title={t.team}
            subtitle={t.abbreviation}
            stickers={catalog.filter((s) => s.abbreviation === t.abbreviation)}
            inventory={inventory}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            defaultOpen={Boolean(search)}
          />
        ))}

        {!search && extra.length > 0 && (
          <TeamSection
            title="Especiais"
            stickers={extra}
            inventory={inventory}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        )}
      </main>

      {showImport && (
        <ImportModal
          currentInventory={inventory}
          onConfirm={handleImportConfirm}
          onClose={() => setShowImport(false)}
        />
      )}
    </div>
  );
}
