"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { StatusMessage } from "@/src/components/ui/status-message";

type HumorFlavorOption = {
  id: number;
  name: string;
};

type HumorFlavorStep = {
  id: number;
  humor_flavor_id: number;
  step_order: number;
  step_name: string;
  prompt_text: string;
  is_active: boolean;
  humor_flavor: {
    name: string;
  } | null;
};

type HumorFlavorStepRow = Omit<HumorFlavorStep, "humor_flavor"> & {
  humor_flavor: { name: string }[] | { name: string } | null;
};

type HumorFlavorStepFormValues = {
  humor_flavor_id: string;
  step_order: string;
  step_name: string;
  prompt_text: string;
  is_active: boolean;
};

const emptyForm: HumorFlavorStepFormValues = {
  humor_flavor_id: "",
  step_order: "1",
  step_name: "",
  prompt_text: "",
  is_active: true,
};

export function HumorFlavorStepManager() {
  const [steps, setSteps] = useState<HumorFlavorStep[]>([]);
  const [flavors, setFlavors] = useState<HumorFlavorOption[]>([]);
  const [formValues, setFormValues] = useState<HumorFlavorStepFormValues>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: "success" | "error" | "loading";
    message: string;
  } | null>(null);

  async function initialize() {
    await Promise.all([loadFlavors(), loadSteps()]);
  }

  async function loadFlavors() {
    const { data, error } = await supabase
      .from("humor_flavor")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      setStatus({
        tone: "error",
        message: `Could not load humor flavors: ${error.message}`,
      });
      return;
    }

    setFlavors((data ?? []) as HumorFlavorOption[]);
  }

  async function loadSteps() {
    setIsLoading(true);
    setStatus({ tone: "loading", message: "Loading humor flavor steps..." });

    const { data, error } = await supabase
      .from("humor_flavor_step")
      .select(
        "id, humor_flavor_id, step_order, step_name, prompt_text, is_active, humor_flavor:humor_flavor_id(name)",
      )
      .order("humor_flavor_id", { ascending: true })
      .order("step_order", { ascending: true });

    if (error) {
      setStatus({
        tone: "error",
        message: `Could not load humor flavor steps: ${error.message}`,
      });
      setIsLoading(false);
      return;
    }

    const normalizedSteps = ((data ?? []) as HumorFlavorStepRow[]).map((step) => ({
      ...step,
      humor_flavor: Array.isArray(step.humor_flavor)
        ? (step.humor_flavor[0] ?? null)
        : step.humor_flavor,
    }));

    setSteps(normalizedSteps);
    setStatus(null);
    setIsLoading(false);
  }

  function resetForm() {
    setFormValues(emptyForm);
    setEditingId(null);
  }

  function startEdit(step: HumorFlavorStep) {
    setEditingId(step.id);
    setFormValues({
      humor_flavor_id: String(step.humor_flavor_id),
      step_order: String(step.step_order),
      step_name: step.step_name,
      prompt_text: step.prompt_text,
      is_active: step.is_active,
    });
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus({
      tone: "loading",
      message: editingId ? "Updating step..." : "Creating step...",
    });

    const payload = {
      humor_flavor_id: Number(formValues.humor_flavor_id),
      step_order: Number(formValues.step_order),
      step_name: formValues.step_name.trim(),
      prompt_text: formValues.prompt_text.trim(),
      is_active: formValues.is_active,
    };

    const query = editingId
      ? supabase.from("humor_flavor_step").update(payload).eq("id", editingId)
      : supabase.from("humor_flavor_step").insert(payload);

    const { error } = await query;

    if (error) {
      setStatus({
        tone: "error",
        message: `Could not save humor flavor step: ${error.message}`,
      });
      setIsSaving(false);
      return;
    }

    resetForm();
    await loadSteps();
    setStatus({
      tone: "success",
      message: editingId
        ? "Humor flavor step updated successfully."
        : "Humor flavor step created successfully.",
    });
    setIsSaving(false);
  }

  async function handleDelete(id: number) {
    setStatus({ tone: "loading", message: "Deleting humor flavor step..." });

    const { error } = await supabase
      .from("humor_flavor_step")
      .delete()
      .eq("id", id);

    if (error) {
      setStatus({
        tone: "error",
        message: `Could not delete humor flavor step: ${error.message}`,
      });
      return;
    }

    if (editingId === id) {
      resetForm();
    }

    await loadSteps();
    setStatus({
      tone: "success",
      message: "Humor flavor step deleted successfully.",
    });
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void Promise.all([loadFlavors(), loadSteps()]);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">
              {editingId ? "Edit Humor Flavor Step" : "New Humor Flavor Step"}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Each step belongs to a flavor and runs in display order.
            </p>
          </div>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">
              Humor Flavor
            </span>
            <select
              required
              value={formValues.humor_flavor_id}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  humor_flavor_id: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
            >
              <option value="">Select a flavor</option>
              {flavors.map((flavor) => (
                <option key={flavor.id} value={flavor.id}>
                  {flavor.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Step Order</span>
            <input
              required
              type="number"
              min="1"
              value={formValues.step_order}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  step_order: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-zinc-800">Step Name</span>
            <input
              required
              value={formValues.step_name}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  step_name: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
              placeholder="Draft observation"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-zinc-300 px-4 py-3">
            <input
              type="checkbox"
              checked={formValues.is_active}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  is_active: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-zinc-300"
            />
            <span className="text-sm font-medium text-zinc-800">Active</span>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium text-zinc-800">Prompt Text</span>
            <textarea
              required
              value={formValues.prompt_text}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  prompt_text: event.target.value,
                }))
              }
              className="min-h-40 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
              placeholder="Write the prompt used for this step."
            />
          </label>

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isSaving
                ? "Saving..."
                : editingId
                  ? "Update Step"
                  : "Create Step"}
            </button>
            <button
              type="button"
              onClick={() => void initialize()}
              className="rounded-full border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
            >
              Refresh
            </button>
          </div>
        </form>
      </section>

      {status ? <StatusMessage tone={status.tone} message={status.message} /> : null}

      <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-zinc-950">
            Humor Flavor Steps
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            {isLoading ? "Fetching rows..." : `${steps.length} total rows`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Flavor</th>
                <th className="px-6 py-4 font-medium">Order</th>
                <th className="px-6 py-4 font-medium">Step Name</th>
                <th className="px-6 py-4 font-medium">Prompt Text</th>
                <th className="px-6 py-4 font-medium">Active</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {steps.map((step) => (
                <tr key={step.id} className="align-top">
                  <td className="px-6 py-4 text-zinc-500">{step.id}</td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {step.humor_flavor?.name ?? `Flavor #${step.humor_flavor_id}`}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">{step.step_order}</td>
                  <td className="px-6 py-4 text-zinc-900">{step.step_name}</td>
                  <td className="max-w-md px-6 py-4 text-zinc-600">
                    <div className="whitespace-pre-wrap">{step.prompt_text}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        step.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {step.is_active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(step)}
                        className="rounded-full border border-zinc-300 px-3 py-2 font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(step.id)}
                        className="rounded-full border border-rose-200 px-3 py-2 font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && steps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-zinc-500">
                    No humor flavor steps found yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
