"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type PropertyLite = {
  title?: string;
  bedrooms?: number;
  price?: number;
  currency?: string;
  operation?: "sale" | "rent" | "temporal";
};

type Props = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  origin?: string;
  property?: PropertyLite;
  lastActivity?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  className?: string;
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatPrice(value?: number, currency?: string) {
  if (typeof value !== "number") return "";
  try {
    const locale = currency === "USD" ? "en-US" : "es-AR";
    return new Intl.NumberFormat(locale, { style: "currency", currency: currency || "USD" }).format(value);
  } catch (e) {
    return `${value}`;
  }
}

export default function CardLead({ id, name, phone, email, origin, property, lastActivity, draggable, onDragStart, className }: Props) {
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  const op = property?.operation;

  return (
    <Link
      href={`/admin/leads/${id}`}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, id)}
      className={cn("relative block rounded-md border border-slate-100 bg-white p-4 shadow-sm cursor-grab ", className)}
    >
      {op && (
        <span className={cn(
          "absolute top-2 right-2 rounded-full px-2 py-1 text-xs font-semibold",
          op === "sale" ? "bg-emerald-100 text-emerald-800" : op === "rent" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"
        )}>
          {op === "sale" ? "Venta" : op === "rent" ? "Alquiler" : "Alquiler temp"}
        </span>
      )}

      <div className="flex items-start flex-col justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="text-nowrap font-medium text-slate-800">{name}</div>
          </div>

          <div className="mt-2 text-sm text-slate-500">{property ? `${property.title ?? ""} · ${property.bedrooms ?? ""}BR` : "Sin propiedad"}</div>

          <div className="mt-3 items-center flex gap-3">
            <div className="flex items-center gap-2">
                <div className="text-[15px] font-semibold text-slate-900">{formatPrice(property?.price, property?.currency)}</div>
              <button
                onClick={() => setShowPhone((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
                aria-label="Show phone"
              >
                <Phone className="h-4 w-4" />
                {showPhone && <span className="text-xs text-slate-600">{phone}</span>}
              </button>

              <button
                onClick={() => setShowEmail((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-700 hover:bg-slate-300"
                aria-label="Show email"
              >
                <Mail className="h-4 w-4" />
                {showEmail && <span className="text-xs text-slate-600">{email}</span>}
              </button>
              <Avatar size="sm">
                <AvatarFallback>{getInitials(name)}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
