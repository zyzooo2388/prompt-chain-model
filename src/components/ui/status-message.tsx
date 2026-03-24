"use client";

type StatusTone = "success" | "error" | "loading";

const toneClasses: Record<StatusTone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  loading: "border-sky-200 bg-sky-50 text-sky-800",
};

type StatusMessageProps = {
  message: string;
  tone: StatusTone;
};

export function StatusMessage({ message, tone }: StatusMessageProps) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${toneClasses[tone]}`}
    >
      {message}
    </div>
  );
}
