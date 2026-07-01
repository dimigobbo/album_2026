"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && user) router.replace("/album");
  }, [user, loading, router]);

  const handleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Não foi possível entrar. Tente novamente.");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center bg-stone-50 dark:bg-stone-950">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
          Copa do Mundo 2026
        </p>
        <h1 className="mt-2 text-3xl font-bold text-stone-900 dark:text-stone-100">
          Meu Álbum de Figurinhas
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-stone-500 dark:text-stone-400">
          Controle o que falta, organize as repetidas e compartilhe sua lista de trocas em segundos.
        </p>
      </div>
      <button
        onClick={handleLogin}
        className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-400"
      >
        Entrar com Google
      </button>
      {error && <p className="text-sm text-rose-500">{error}</p>}
    </div>
  );
}
