"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { getCatalog, getTeams } from "@/lib/catalog";
import Header from "../components/Header";
import TeamSection from "../components/TeamSection";

export default function AlbumPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = useState(null);
  const [search, setSearch] = useState("");

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
    const q = search.trim().toLowerCase();
    if (!q) return teams;
    return teams.filter(
      (t) => t.team.toLowerCase().includes(q) || t.abbreviation.toLowerCase().includes(q)
    );
  }, [teams, search]);

  // Atualização otimista: muda a UI na hora e grava no Firestore em
  // paralelo, usando notação de ponto pra alterar só esse campo do mapa
  // (sem reescrever o inventário inteiro a cada toque).
  const updateQty = async (code, qty) => {
    if (!user) return;
    setInventory((prev) => ({ ...prev, [code]: qty }));
    await updateDoc(doc(db, "users", user.uid), { [`inventory.${code}`]: qty });
  };

  const handleIncrement = (code, current) => updateQty(code, current + 1);
  const handleDecrement = (code, current) => updateQty(code, Math.max(0, current - 1));

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
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar seleção (ex: Brasil ou BRA)"
          className="w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-sm placeholder:text-stone-500 focus:border-emerald-400 focus:outline-none"
        />

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
    </div>
  );
}
