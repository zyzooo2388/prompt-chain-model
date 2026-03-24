"use client";

import type { AdminStatusTone } from "@/src/lib/types";

const toneClasses: Record<AdminStatusTone, string> = {
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-700",
  error: "border-rose-400/40 bg-rose-500/10 text-rose-700",
  loading: "border-sky-400/40 bg-sky-500/10 text-sky-700",
  info: "border-amber-400/40 bg-amber-500/10 text-amber-700",
};

export function AdminStatusBanner({
  message,
  tone,
}: {
  message: string;
  tone: AdminStatusTone;
}) {
  return <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${toneClasses[tone]}`}>{message}</div>;
}
