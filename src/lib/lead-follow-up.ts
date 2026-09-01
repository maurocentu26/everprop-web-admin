const DAY_IN_MS = 24 * 60 * 60 * 1000;
const OVERDUE_AFTER_DAYS = 10;

export type LeadFollowUpState = {
  kind: "none" | "updated" | "overdue";
  title: string;
  detail: string;
  formattedDate?: string;
  elapsedDays?: number;
};

export function getLeadFollowUpState(
  followUpUpdatedAt?: string,
  now: Date = new Date(),
): LeadFollowUpState {
  if (!followUpUpdatedAt) {
    return {
      kind: "none",
      title: "Sin seguimiento",
      detail: "Todavía no se registró una actualización de seguimiento.",
    };
  }

  const updatedAt = new Date(followUpUpdatedAt);
  if (Number.isNaN(updatedAt.getTime())) {
    return {
      kind: "none",
      title: "Sin seguimiento",
      detail: "Todavía no se registró una actualización de seguimiento.",
    };
  }

  const elapsedDays = Math.max(0, Math.floor((now.getTime() - updatedAt.getTime()) / DAY_IN_MS));
  const overdue = now.getTime() - updatedAt.getTime() > OVERDUE_AFTER_DAYS * DAY_IN_MS;
  const formattedDate = updatedAt.toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return {
    kind: overdue ? "overdue" : "updated",
    title: overdue ? "Seguimiento atrasado" : "Seguimiento actualizado",
    detail:
      elapsedDays === 0
        ? "Actualizado hoy"
        : `Actualizado hace ${elapsedDays} ${elapsedDays === 1 ? "día" : "días"}`,
    formattedDate,
    elapsedDays,
  };
}
