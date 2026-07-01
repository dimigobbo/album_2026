"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Header({ totalOwned = 0, totalStickers = 0 }) {
  const { logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const pct = totalStickers ? Math.round((totalOwned / totalStickers) * 100) : 0;

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">Meu Álbum 2026</p>
          <p className="text-xs text-stone-400">
            {totalOwned}/{totalStickers} figurinhas ({pct}%)
          </p>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/album"
            className={pathname === "/album"
              ? "font-medium text-emerald-600 dark:text-emerald-400"
              : "text-stone-500 dark:text-stone-400"}
          >
            Álbum
          </Link>
          <Link
            href="/relatorios"
            className={pathname === "/relatorios"
              ? "font-medium text-emerald-600 dark:text-emerald-400"
              : "text-stone-500 dark:text-stone-400"}
          >
            Relatórios
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-stone-200 bg-stone-100 px-2 py-1 text-sm dark:border-stone-700 dark:bg-stone-800"
            title={dark ? "Mudar para tema claro" : "Mudar para tema escuro"}
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <button
            onClick={logout}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
