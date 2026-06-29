"use client";

export default function StickerTile({ sticker, qty, onIncrement, onDecrement }) {
  const owned = qty > 0;
  const duplicate = qty > 1;

  const colorClasses = duplicate
    ? "border-amber-400 bg-amber-400/15 text-amber-300"
    : owned
    ? "border-emerald-400 bg-emerald-400/15 text-emerald-300"
    : "border-stone-700 bg-stone-900 text-stone-500";

  return (
    <div className={`group relative aspect-square rounded-lg border text-xs font-medium transition ${colorClasses}`}>
      <button
        onClick={() => onIncrement(sticker.id, qty)}
        className="flex h-full w-full flex-col items-center justify-center"
        title={sticker.name}
      >
        <span className="text-[10px] opacity-70">{sticker.number}</span>
        <span className="text-sm font-semibold">{qty > 0 ? qty : ""}</span>
      </button>
      {qty > 0 && (
        <button
          onClick={() => onDecrement(sticker.id, qty)}
          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-700 text-[10px] text-stone-200"
          aria-label={`Remover uma unidade de ${sticker.id}`}
        >
          −
        </button>
      )}
    </div>
  );
}
