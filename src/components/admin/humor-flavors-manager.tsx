"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { deleteHumorFlavorAction, saveHumorFlavorAction } from "@/app/admin/actions";
import { AdminStatusBanner } from "@/src/components/admin/admin-status-banner";
import type { AdminStatusTone, HumorFlavor } from "@/src/lib/types";

type FlavorFormState = {
  slug: string;
  description: string;
};

const emptyForm: FlavorFormState = {
  slug: "",
  description: "",
};

export function HumorFlavorsManager({ initialFlavors }: { initialFlavors: HumorFlavor[] }) {
  const [flavors, setFlavors] = useState(initialFlavors);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FlavorFormState>(emptyForm);
  const [status, setStatus] = useState<{ tone: AdminStatusTone; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredFlavors = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return flavors;
    }

    return flavors.filter((flavor) => {
      return (
        flavor.slug.toLowerCase().includes(normalizedQuery) ||
        (flavor.description ?? "").toLowerCase().includes(normalizedQuery) ||
        String(flavor.id).includes(normalizedQuery)
      );
    });
  }, [flavors, query]);

  function startEdit(flavor: HumorFlavor) {
    setEditingId(flavor.id);
    setForm({
      slug: flavor.slug,
      description: flavor.description ?? "",
    });
    setStatus(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({
      tone: "loading",
      message: editingId ? "Updating humor flavor..." : "Creating humor flavor...",
    });

    startTransition(async () => {
      const result = await saveHumorFlavorAction(editingId, form);
      setStatus({ tone: result.ok ? "success" : "error", message: result.message });

      if (result.ok && result.data) {
        setFlavors(result.data);
        resetForm();
      }
    });
  }

  function handleDelete(flavor: HumorFlavor) {
    const confirmed = window.confirm(
      `Delete humor flavor "${flavor.slug}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setStatus({ tone: "loading", message: "Deleting humor flavor..." });
    startTransition(async () => {
      const result = await deleteHumorFlavorAction(flavor.id);
      setStatus({ tone: result.ok ? "success" : "error", message: result.message });

      if (result.ok && result.data) {
        setFlavors(result.data);
        if (editingId === flavor.id) {
          resetForm();
        }
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--admin-foreground)]">
                {editingId ? "Edit humor flavor" : "Create humor flavor"}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-[var(--admin-muted)]">
                Use the real `humor_flavors` table fields. Slugs should stay stable because the testing flow selects by id but admins recognize flavors by slug.
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--admin-foreground)]">Slug</span>
              <input
                required
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
                placeholder="relatable-humor"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-[var(--admin-foreground)]">Description</span>
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="min-h-36 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
                placeholder="Describe the flavor and when to use it."
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-[var(--admin-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Saving..." : editingId ? "Update flavor" : "Create flavor"}
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
        </div>

        <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[var(--admin-foreground)]">Search</h2>
          <p className="mt-2 text-sm text-[var(--admin-muted)]">
            Filter by slug, description, or id.
          </p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-4 w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
            placeholder="Search humor flavors"
          />

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                Total
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-[var(--admin-foreground)]">{flavors.length}</dd>
            </div>
            <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                Visible
              </dt>
              <dd className="mt-2 text-3xl font-semibold text-[var(--admin-foreground)]">
                {filteredFlavors.length}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {status ? <AdminStatusBanner tone={status.tone} message={status.message} /> : null}

      <section className="overflow-hidden rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-sm">
        <div className="border-b border-[var(--admin-border)] px-6 py-4">
          <h2 className="text-xl font-semibold text-[var(--admin-foreground)]">Humor flavors</h2>
          <p className="mt-1 text-sm text-[var(--admin-muted)]">
            Table rows from `humor_flavors`.
          </p>
        </div>

        {filteredFlavors.length === 0 ? (
          <div className="px-6 py-10 text-sm text-[var(--admin-muted)]">No humor flavors match the current filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--admin-surface-strong)] text-[var(--admin-muted)]">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Slug</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Created</th>
                  <th className="px-6 py-4 font-semibold">Modified</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFlavors.map((flavor) => (
                  <tr key={flavor.id} className="border-t border-[var(--admin-border)] align-top">
                    <td className="px-6 py-4 text-[var(--admin-foreground)]">{flavor.id}</td>
                    <td className="px-6 py-4 font-medium text-[var(--admin-foreground)]">{flavor.slug}</td>
                    <td className="px-6 py-4 text-[var(--admin-muted)]">{flavor.description ?? "—"}</td>
                    <td className="px-6 py-4 text-[var(--admin-muted)]">{flavor.created_datetime_utc ?? "—"}</td>
                    <td className="px-6 py-4 text-[var(--admin-muted)]">{flavor.modified_datetime_utc ?? "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(flavor)}
                          className="rounded-full border border-[var(--admin-border)] px-3 py-1.5 font-medium text-[var(--admin-foreground)] transition hover:bg-[var(--admin-surface-strong)]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(flavor)}
                          className="rounded-full border border-rose-400/40 px-3 py-1.5 font-medium text-rose-600 transition hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
