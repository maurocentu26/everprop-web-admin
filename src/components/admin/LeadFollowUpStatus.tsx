import { CircleAlert, Clock3 } from "lucide-react";

import { getLeadFollowUpState } from "@/lib/lead-follow-up";
import { cn } from "@/lib/utils";

type LeadFollowUpStatusProps = {
  updatedAt?: string;
  compact?: boolean;
  className?: string;
};

export function LeadFollowUpStatus({
  updatedAt,
  compact = false,
  className,
}: LeadFollowUpStatusProps) {
  const state = getLeadFollowUpState(updatedAt);
  const overdue = state.kind === "overdue";
  const empty = state.kind === "none";
  const Icon = overdue ? CircleAlert : Clock3;

  if (compact) {
    return (
      <div className={cn("min-w-0", className)} role="status">
        <span
          className={cn(
            "inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold",
            overdue && "border-rose-200 bg-rose-50 text-rose-700",
            empty && "border-slate-200 bg-slate-100 text-slate-700",
            state.kind === "updated" && "border-emerald-200 bg-emerald-50 text-emerald-700",
          )}
        >
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          {overdue ? "Atrasado" : state.title}
        </span>
        {!empty && (
          <>
            <span className={cn("mt-1 block text-xs", overdue ? "font-semibold text-rose-700" : "text-slate-500")}>
              {state.detail}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">{state.formattedDate}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border p-4",
        overdue && "border-rose-200 bg-rose-50 text-rose-950",
        empty && "border-slate-200 bg-slate-100 text-slate-900",
        state.kind === "updated" && "border-emerald-200 bg-emerald-50 text-emerald-950",
        className,
      )}
      role="status"
    >
      <Icon
        className={cn(
          "mt-0.5 size-6 shrink-0",
          overdue && "text-rose-700",
          empty && "text-slate-600",
          state.kind === "updated" && "text-emerald-700",
        )}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <p className="text-base font-bold">{state.title}</p>
        <p className="mt-1 text-base leading-7 opacity-85">{state.detail}</p>
        {state.formattedDate && (
          <p className="mt-1 text-sm font-semibold opacity-75">Última actualización: {state.formattedDate}</p>
        )}
      </div>
    </div>
  );
}
