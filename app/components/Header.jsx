"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Header({ totalOwned = 0, totalStickers = 0 }) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const pct = totalStickers ? Math.round((totalOwned / totalStickers) * 100) : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-stone-800 bg-stone-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-stone-100">Meu Álbum 2026</p>
          <p className="text-xs text-stone-500">
            {totalOwned}/{totalStickers} figurinhas ({pct}%)
          </p>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/album"
            className={pathname === "/album" ? "font-medium text-emerald-400" : "text-stone-400"}
          >
            Álbum
          </Link>
          <Link
            href="/relatorios"
            className={pathname === "/relatorios" ? "font-medium text-emerald-400" : "text-stone-400"}
          >
            Relatórios
          </Link>
          <button onClick={logout} className="text-stone-500 hover:text-stone-300">
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
