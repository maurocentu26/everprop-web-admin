"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

type Item = {
  key?: string;
  label: React.ReactNode;
  onClick?: () => void;
};

export default function DropdownMenu({
  trigger,
  items,
  align = "right",
}: {
  trigger: React.ReactNode;
  items: Item[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (ref.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          <ul className="py-1">
            {items.map((it, idx) => (
              <li key={it.key ?? idx}>
                <button
                  onClick={() => {
                    setOpen(false);
                    it.onClick?.();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  {it.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
