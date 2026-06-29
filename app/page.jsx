"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/album" : "/login");
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-stone-400">Carregando...</p>
    </div>
  );
}
