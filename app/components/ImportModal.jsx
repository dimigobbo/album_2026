"use client";

import { useState } from "react";
import { parseImport } from "@/lib/importParser";

export default function ImportModal({ currentInventory, onConfirm, onClose }) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [step, setStep] = useState("paste"); // "paste" | "preview" | "done"

  const handleParse = () => {
    const result = parseImport(text, currentInventory);
    setPreview(result);
    setStep("preview");
  };

  const handleConfirm = async () => {
    await onConfirm(preview.inventory);
    setStep("done");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-stone-700 bg-stone-900 p-6 shadow-2xl">

        {/* Cabeçalho */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-100">Importar lista</h2>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-300 text-xl leading-none">✕</button>
        </div>

        {/* Passo 1: colar o texto */}
        {step === "paste" && (
          <>
            <p className="mb-3 text-sm text-stone-400">
              Cole aqui a lista de <span className="text-stone-200 font-medium">faltantes</span> exportada
              do outro app. O formato esperado é uma linha por seleção:
              <br />
              <code className="mt-1 block rounded bg-stone-800 px-2 py-1 text-xs text-emerald-400">
                MEX: 3, 5, 6, 8, 10
              </code>
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Cole o texto aqui...\n\nFWC: 1, 3, 4\nBRA: 1, 4, 12, 13\nARG: 1, 3, 5, 6"}
              rows={12}
              className="w-full rounded-lg border border-stone-700 bg-stone-800 px-3 py-2 text-sm text-stone-200 placeholder:text-stone-600 focus:border-emerald-400 focus:outline-none font-mono"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-stone-400 hover:text-stone-200">
                Cancelar
              </button>
              <button
                onClick={handleParse}
                disabled={!text.trim()}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400 disabled:opacity-40"
              >
                Analisar lista →
              </button>
            </div>
          </>
        )}

        {/* Passo 2: preview + confirmação */}
        {step === "preview" && preview && (
          <>
            {/* Erros de parse (avisos, não bloqueiam) */}
            {preview.errors.length > 0 && (
              <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="mb-1 text-xs font-semibold text-amber-400">Avisos ({preview.errors.length})</p>
                <ul className="max-h-24 overflow-y-auto space-y-0.5 text-xs text-amber-300">
                  {preview.errors.map((e, i) => <li key={i}>• {e}</li>)}
                </ul>
              </div>
            )}

            {/* Stats do import */}
            {preview.stats ? (
              <>
                <div className="mb-4 grid grid-cols-3 gap-3">
                  <Stat label="Seleções" value={preview.stats.teamsImported} color="text-stone-100" />
                  <Stat label="Possuídas" value={preview.stats.totalOwned} color="text-emerald-400" />
                  <Stat label="Faltantes" value={preview.stats.totalMissing} color="text-rose-400" />
                </div>
                <p className="mb-4 rounded-lg border border-stone-700 bg-stone-800 p-3 text-sm text-stone-400">
                  ⚠️ Isso vai <span className="text-stone-200 font-medium">substituir</span> o progresso
                  das seleções importadas. Figurinhas de seleções{" "}
                  <span className="text-stone-200 font-medium">não incluídas</span> no texto ficam intactas.
                </p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setStep("paste")} className="rounded-lg px-4 py-2 text-sm text-stone-400 hover:text-stone-200">
                    ← Voltar
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
                  >
                    Confirmar importação
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-rose-400">Não foi possível reconhecer nenhuma seleção no texto.</p>
                <button onClick={() => setStep("paste")} className="rounded-lg px-4 py-2 text-sm text-stone-400 hover:text-stone-200">
                  ← Voltar
                </button>
              </>
            )}
          </>
        )}

        {/* Passo 3: sucesso */}
        {step === "done" && (
          <div className="py-4 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-semibold text-stone-100">Importação concluída!</p>
            <p className="mt-1 text-sm text-stone-400">Seu álbum foi atualizado.</p>
            <button
              onClick={onClose}
              className="mt-6 rounded-lg bg-emerald-500 px-6 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              Fechar
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-lg border border-stone-700 bg-stone-800 p-3 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}
