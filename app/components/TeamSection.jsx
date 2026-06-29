"use client";

import { useState } from "react";
import StickerTile from "./StickerTile";

export default function TeamSection({
  title,
  subtitle,
  stickers,
  inventory,
  onIncrement,
  onDecrement,
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const owned = stickers.filter((s) => (inventory[s.id] || 0) > 0).length;
  const complete = owned === stickers.length;

  return (
    <div className="rounded-xl border border-stone-800 bg-stone-900/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <p className="font-semibold text-stone-100">
          {title} {subtitle && <span className="text-stone-500">({subtitle})</span>}
        </p>
        <span className="flex items-center gap-3">
          <span className={`text-sm ${complete ? "text-emerald-400" : "text-stone-400"}`}>
            {owned}/{stickers.length}
          </span>
          <span className="text-stone-500">{open ? "−" : "+"}</span>
        </span>
      </button>
      {open && (
        <div className="grid grid-cols-5 gap-2 px-4 pb-4 sm:grid-cols-8">
          {stickers.map((s) => (
            <StickerTile
              key={s.id}
              sticker={s}
              qty={inventory[s.id] || 0}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
          ))}
        </div>
      )}
    </div>
  );
}
