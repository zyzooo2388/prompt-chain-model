"use client";

import { FormEvent, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import { StatusMessage } from "@/src/components/ui/status-message";

type HumorFlavor = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
};

type HumorFlavorFormValues = {
  name: string;
  description: string;
  is_active: boolean;
};

const emptyForm: HumorFlavorFormValues = {
  name: "",
  description: "",
  is_active: true,
};

const supabase = createSupabaseBrowserClient();

export function HumorFlavorManager() {
  const [flavors, setFlavors] = useState<HumorFlavor[]>([]);
  const [formValues, setFormValues] = useState<HumorFlavorFormValues>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{
    tone: "success" | "error" | "loading";
    message: string;
  } | null>(null);

  async function loadFlavors() {
    setIsLoading(true);
    setStatus({ tone: "loading", message: "Loading humor flavors..." });

    const { data, error } = await supabase
      .from("humor_flavor")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setStatus({
        tone: "error",
        message: `Could not load humor flavors: ${error.message}`,
      });
      setIsLoading(false);
      return;
    }

    setFlavors((data ?? []) as HumorFlavor[]);
    setStatus(null);
    setIsLoading(false);
  }

  function resetForm() {
    setFormValues(emptyForm);
    setEditingId(null);
  }

  function startEdit(flavor: HumorFlavor) {
    setEditingId(flavor.id);
    setFormValues({
      name: flavor.name,
      description: flavor.description ?? "",
      is_active: flavor.is_active,
    });
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatus({
      tone: "loading",
      message: editingId
        ? "Updating humor flavor..."
        : "Creating humor flavor...",
    });

    const payload = {
      name: formValues.name.trim(),
      description: formValues.description.trim() || null,
      is_active: formValues.is_active,
    };

    const query = editingId
      ? supabase.from("humor_flavor").update(payload).eq("id", editingId)
      : supabase.from("humor_flavor").insert(payload);

    const { error } = await query;

    if (error) {
      setStatus({
        tone: "error",
        message: `Could not save humor flavor: ${error.message}`,
      });
      setIsSaving(false);
      return;
    }

    resetForm();
    await loadFlavors();
    setStatus({
      tone: "success",
      message: editingId
        ? "Humor flavor updated successfully."
        : "Humor flavor created successfully.",
    });
    setIsSaving(false);
  }

  async function handleDelete(id: number) {
    setStatus({ tone: "loading", message: "Deleting humor flavor..." });

    const { error } = await supabase.from("humor_flavor").delete().eq("id", id);

    if (error) {
      setStatus({
        tone: "error",
        message: `Could not delete humor flavor: ${error.message}`,
      });
      return;
    }

    if (editingId === id) {
      resetForm();
    }

    await loadFlavors();
    setStatus({
      tone: "success",
      message: "Humor flavor deleted successfully.",
    });
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadFlavors();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950">
              {editingId ? "Edit Humor Flavor" : "New Humor Flavor"}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">
              Create and manage flavor records from one place.
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
            <span className="text-sm font-medium text-zinc-800">Name</span>
            <input
              required
              value={formValues.name}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
              placeholder="Dry wit"
            />
          </label>

          <label className="space-y-2 md:row-span-2">
            <span className="text-sm font-medium text-zinc-800">
              Description
            </span>
            <textarea
              value={formValues.description}
              onChange={(event) =>
                setFormValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="min-h-32 w-full rounded-2xl border border-zinc-300 px-4 py-3 text-sm outline-none transition focus:border-zinc-950"
              placeholder="Describe what makes this flavor distinct."
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

          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isSaving
                ? "Saving..."
                : editingId
                  ? "Update Flavor"
                  : "Create Flavor"}
            </button>
            <button
              type="button"
              onClick={() => void loadFlavors()}
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
          <h2 className="text-xl font-semibold text-zinc-950">Humor Flavors</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {isLoading ? "Fetching rows..." : `${flavors.length} total rows`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-left text-zinc-600">
              <tr>
                <th className="px-6 py-4 font-medium">ID</th>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Active</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {flavors.map((flavor) => (
                <tr key={flavor.id} className="align-top">
                  <td className="px-6 py-4 text-zinc-500">{flavor.id}</td>
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    {flavor.name}
                  </td>
                  <td className="px-6 py-4 text-zinc-600">
                    {flavor.description || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        flavor.is_active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {flavor.is_active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(flavor)}
                        className="rounded-full border border-zinc-300 px-3 py-2 font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(flavor.id)}
                        className="rounded-full border border-rose-200 px-3 py-2 font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && flavors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-500">
                    No humor flavors found yet.
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
