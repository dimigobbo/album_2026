"use client";

import { useState } from "react";

export default function ResetModal({ totalOwned, onConfirm, onClose }) {
  const [step, setStep] = useState("warn"); // "warn" | "done"
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setStep("done");
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-stone-700 bg-stone-900 p-6 shadow-2xl">

        {step === "warn" && (
          <>
            <div className="mb-4 text-center">
              <p className="text-4xl mb-2">⚠️</p>
              <h2 className="text-lg font-bold text-stone-100">Zerar álbum</h2>
              <p className="mt-2 text-sm text-stone-400">
                Isso vai remover as{" "}
                <span className="text-rose-400 font-semibold">{totalOwned} figurinhas</span>{" "}
                registradas e deixar o álbum completamente vazio.
              </p>
              <p className="mt-2 text-sm font-medium text-rose-400">
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-stone-700 px-4 py-2 text-sm text-stone-300 hover:border-stone-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
              >
                {loading ? "Zerando..." : "Sim, zerar tudo"}
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="py-2 text-center">
            <p className="text-4xl mb-3">🗑️</p>
            <p className="font-semibold text-stone-100">Álbum zerado.</p>
            <p className="mt-1 text-sm text-stone-400">Todas as figurinhas foram removidas.</p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-stone-700 px-6 py-2 text-sm font-semibold text-stone-200 hover:bg-stone-600"
            >
              Fechar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
