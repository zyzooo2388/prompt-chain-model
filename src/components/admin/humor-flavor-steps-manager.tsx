"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import {
  deleteHumorFlavorStepAction,
  reorderHumorFlavorStepAction,
  saveHumorFlavorStepAction,
} from "@/app/admin/actions";
import { AdminStatusBanner } from "@/src/components/admin/admin-status-banner";
import type {
  AdminStatusTone,
  FlavorOption,
  HumorFlavorStepInput,
  HumorFlavorStepWithFlavor,
} from "@/src/lib/types";

type StepFormState = {
  humor_flavor_id: string;
  order_by: string;
  humor_flavor_step_type_id: string;
  llm_model_id: string;
  llm_input_type_id: string;
  llm_output_type_id: string;
  llm_temperature: string;
  llm_system_prompt: string;
  llm_user_prompt: string;
  description: string;
};

const emptyForm: StepFormState = {
  humor_flavor_id: "",
  order_by: "1",
  humor_flavor_step_type_id: "1",
  llm_model_id: "1",
  llm_input_type_id: "1",
  llm_output_type_id: "1",
  llm_temperature: "0.7",
  llm_system_prompt: "",
  llm_user_prompt: "",
  description: "",
};

function toInput(form: StepFormState): HumorFlavorStepInput {
  return {
    humor_flavor_id: Number(form.humor_flavor_id),
    order_by: Number(form.order_by),
    humor_flavor_step_type_id: Number(form.humor_flavor_step_type_id),
    llm_model_id: Number(form.llm_model_id),
    llm_input_type_id: Number(form.llm_input_type_id),
    llm_output_type_id: Number(form.llm_output_type_id),
    llm_temperature: Number(form.llm_temperature),
    llm_system_prompt: form.llm_system_prompt,
    llm_user_prompt: form.llm_user_prompt,
    description: form.description,
  };
}

function groupSteps(steps: HumorFlavorStepWithFlavor[]) {
  const groups = new Map<number, { flavorId: number; flavorSlug: string; steps: HumorFlavorStepWithFlavor[] }>();
  for (const step of steps) {
    const entry = groups.get(step.humor_flavor_id) ?? {
      flavorId: step.humor_flavor_id,
      flavorSlug: step.humorFlavor?.slug ?? `Flavor ${step.humor_flavor_id}`,
      steps: [],
    };
    entry.steps.push(step);
    groups.set(step.humor_flavor_id, entry);
  }

  return Array.from(groups.values()).sort((a, b) => a.flavorId - b.flavorId);
}

export function HumorFlavorStepsManager({
  initialSteps,
  flavors,
}: {
  initialSteps: HumorFlavorStepWithFlavor[];
  flavors: FlavorOption[];
}) {
  const [steps, setSteps] = useState(initialSteps);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFlavorFilter, setSelectedFlavorFilter] = useState<string>("all");
  const [status, setStatus] = useState<{ tone: AdminStatusTone; message: string } | null>(null);
  const [form, setForm] = useState<StepFormState>(emptyForm);
  const [isPending, startTransition] = useTransition();

  const visibleSteps = useMemo(() => {
    if (selectedFlavorFilter === "all") {
      return steps;
    }

    return steps.filter((step) => String(step.humor_flavor_id) === selectedFlavorFilter);
  }, [selectedFlavorFilter, steps]);

  const groupedSteps = useMemo(() => groupSteps(visibleSteps), [visibleSteps]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(step: HumorFlavorStepWithFlavor) {
    setEditingId(step.id);
    setForm({
      humor_flavor_id: String(step.humor_flavor_id),
      order_by: String(step.order_by),
      humor_flavor_step_type_id: String(step.humor_flavor_step_type_id),
      llm_model_id: String(step.llm_model_id),
      llm_input_type_id: String(step.llm_input_type_id),
      llm_output_type_id: String(step.llm_output_type_id),
      llm_temperature: String(step.llm_temperature ?? 0.7),
      llm_system_prompt: step.llm_system_prompt ?? "",
      llm_user_prompt: step.llm_user_prompt ?? "",
      description: step.description ?? "",
    });
    setStatus(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({
      tone: "loading",
      message: editingId ? "Updating humor flavor step..." : "Creating humor flavor step...",
    });

    startTransition(async () => {
      const result = await saveHumorFlavorStepAction(editingId, toInput(form));
      setStatus({ tone: result.ok ? "success" : "error", message: result.message });

      if (result.ok && result.data) {
        setSteps(result.data);
        resetForm();
      }
    });
  }

  function handleDelete(step: HumorFlavorStepWithFlavor) {
    const confirmed = window.confirm(
      `Delete step ${step.order_by} for ${step.humorFlavor?.slug ?? `flavor ${step.humor_flavor_id}`}? Remaining steps will be renumbered.`,
    );

    if (!confirmed) {
      return;
    }

    setStatus({ tone: "loading", message: "Deleting humor flavor step..." });
    startTransition(async () => {
      const result = await deleteHumorFlavorStepAction(step.id);
      setStatus({ tone: result.ok ? "success" : "error", message: result.message });
      if (result.ok && result.data) {
        setSteps(result.data);
        if (editingId === step.id) {
          resetForm();
        }
      }
    });
  }

  function handleMove(stepId: number, direction: "up" | "down") {
    setStatus({
      tone: "loading",
      message: direction === "up" ? "Moving step up..." : "Moving step down...",
    });
    startTransition(async () => {
      const result = await reorderHumorFlavorStepAction(stepId, direction);
      setStatus({ tone: result.ok ? "success" : "error", message: result.message });
      if (result.ok && result.data) {
        setSteps(result.data);
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          className="space-y-4 rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--admin-foreground)]">
                {editingId ? "Edit humor flavor step" : "Create humor flavor step"}
              </h2>
              <p className="mt-2 text-sm text-[var(--admin-muted)]">
                Steps stay ordered per flavor using `order_by`. Saves renumber safely after create, update, delete, and reorder actions.
              </p>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-[var(--admin-border)] px-4 py-2 text-sm font-medium text-[var(--admin-muted)] transition hover:bg-[var(--admin-surface-strong)]"
              >
                Cancel
              </button>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--admin-foreground)]">Humor flavor</span>
              <select
                required
                value={form.humor_flavor_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, humor_flavor_id: event.target.value }))
                }
                className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
              >
                <option value="">Select a flavor</option>
                {flavors.map((flavor) => (
                  <option key={flavor.id} value={flavor.id}>
                    {flavor.slug} (#{flavor.id})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--admin-foreground)]">order_by</span>
              <input
                required
                min="1"
                type="number"
                value={form.order_by}
                onChange={(event) => setForm((current) => ({ ...current, order_by: event.target.value }))}
                className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--admin-foreground)]">humor_flavor_step_type_id</span>
              <input
                required
                min="1"
                type="number"
                value={form.humor_flavor_step_type_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, humor_flavor_step_type_id: event.target.value }))
                }
                className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--admin-foreground)]">llm_model_id</span>
              <input
                required
                min="1"
                type="number"
                value={form.llm_model_id}
                onChange={(event) => setForm((current) => ({ ...current, llm_model_id: event.target.value }))}
                className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--admin-foreground)]">llm_input_type_id</span>
              <input
                required
                min="1"
                type="number"
                value={form.llm_input_type_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, llm_input_type_id: event.target.value }))
                }
                className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-[var(--admin-foreground)]">llm_output_type_id</span>
              <input
                required
                min="1"
                type="number"
                value={form.llm_output_type_id}
                onChange={(event) =>
                  setForm((current) => ({ ...current, llm_output_type_id: event.target.value }))
                }
                className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-[var(--admin-foreground)]">llm_temperature</span>
              <input
                required
                type="number"
                step="0.1"
                value={form.llm_temperature}
                onChange={(event) =>
                  setForm((current) => ({ ...current, llm_temperature: event.target.value }))
                }
                className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-foreground)]">llm_system_prompt</span>
            <textarea
              value={form.llm_system_prompt}
              onChange={(event) =>
                setForm((current) => ({ ...current, llm_system_prompt: event.target.value }))
              }
              className="min-h-40 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-foreground)]">llm_user_prompt</span>
            <textarea
              value={form.llm_user_prompt}
              onChange={(event) =>
                setForm((current) => ({ ...current, llm_user_prompt: event.target.value }))
              }
              className="min-h-40 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-foreground)]">description</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-28 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-full bg-[var(--admin-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? "Saving..." : editingId ? "Update step" : "Create step"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-[var(--admin-border)] px-5 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-[var(--admin-surface-strong)]"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[var(--admin-foreground)]">Filter and inspect</h2>
          <p className="mt-2 text-sm text-[var(--admin-muted)]">
            Steps stay grouped by flavor and displayed by `humor_flavor_id` ascending, then `order_by` ascending.
          </p>
          <label className="mt-4 block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-foreground)]">Filter by humor flavor</span>
            <select
              value={selectedFlavorFilter}
              onChange={(event) => setSelectedFlavorFilter(event.target.value)}
              className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
            >
              <option value="all">All flavors</option>
              {flavors.map((flavor) => (
                <option key={flavor.id} value={flavor.id}>
                  {flavor.slug} (#{flavor.id})
                </option>
              ))}
            </select>
          </label>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                Visible flavors
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--admin-foreground)]">{groupedSteps.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                Visible steps
              </p>
              <p className="mt-2 text-3xl font-semibold text-[var(--admin-foreground)]">{visibleSteps.length}</p>
            </div>
          </div>
        </div>
      </section>

      {status ? <AdminStatusBanner tone={status.tone} message={status.message} /> : null}

      {groupedSteps.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] p-10 text-sm text-[var(--admin-muted)]">
          No steps found for the current filter.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSteps.map((group) => (
            <section
              key={group.flavorId}
              className="overflow-hidden rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm"
            >
              <div className="border-b border-[var(--admin-border)] px-6 py-4">
                <h2 className="text-xl font-semibold text-[var(--admin-foreground)]">
                  {group.flavorSlug}
                </h2>
                <p className="mt-1 text-sm text-[var(--admin-muted)]">
                  humor_flavor_id {group.flavorId}
                </p>
              </div>

              <div className="divide-y divide-[var(--admin-border)]">
                {group.steps.map((step, index) => (
                  <article key={step.id} className="space-y-4 px-6 py-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                        <Stat label="id" value={step.id} />
                        <Stat label="order_by" value={step.order_by} />
                        <Stat label="step_type_id" value={step.humor_flavor_step_type_id} />
                        <Stat label="llm_model_id" value={step.llm_model_id} />
                        <Stat label="modified" value={step.modified_datetime_utc ?? "—"} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleMove(step.id, "up")}
                          disabled={isPending || index === 0}
                          className="rounded-full border border-[var(--admin-border)] px-3 py-1.5 text-sm font-medium text-[var(--admin-foreground)] transition hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Move up
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(step.id, "down")}
                          disabled={isPending || index === group.steps.length - 1}
                          className="rounded-full border border-[var(--admin-border)] px-3 py-1.5 text-sm font-medium text-[var(--admin-foreground)] transition hover:bg-[var(--admin-surface-strong)] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Move down
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(step)}
                          className="rounded-full border border-[var(--admin-border)] px-3 py-1.5 text-sm font-medium text-[var(--admin-foreground)] transition hover:bg-[var(--admin-surface-strong)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(step)}
                          className="rounded-full border border-rose-400/40 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <PromptBlock label="llm_input_type_id" value={String(step.llm_input_type_id)} />
                      <PromptBlock label="llm_output_type_id" value={String(step.llm_output_type_id)} />
                      <PromptBlock label="llm_temperature" value={String(step.llm_temperature ?? "—")} />
                      <PromptBlock label="description" value={step.description ?? "—"} />
                      <PromptBlock label="llm_system_prompt" value={step.llm_system_prompt ?? "—"} />
                      <PromptBlock label="llm_user_prompt" value={step.llm_user_prompt ?? "—"} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">{label}</p>
      <p className="mt-1 break-all text-sm font-medium text-[var(--admin-foreground)]">{value}</p>
    </div>
  );
}

function PromptBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-muted)]">{label}</p>
      <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-[var(--admin-foreground)]">
        {value}
      </pre>
    </div>
  );
}
