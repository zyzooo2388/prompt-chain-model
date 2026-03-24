"use client";

import { useMemo, useState } from "react";
import { AdminStatusBanner } from "@/src/components/admin/admin-status-banner";
import type { CaptionBrowserResult, FlavorOption } from "@/src/lib/types";

export function CaptionsBrowser({
  flavors,
  initialResult,
}: {
  flavors: FlavorOption[];
  initialResult: CaptionBrowserResult;
}) {
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>(
    flavors[0] ? String(flavors[0].id) : "",
  );

  const filteredRecords = useMemo(() => {
    if (!selectedFlavorId) {
      return initialResult.records;
    }

    return initialResult.records.filter((record) => String(record.humorFlavorId) === selectedFlavorId);
  }, [initialResult.records, selectedFlavorId]);

  return (
    <div className="space-y-6">
      {!initialResult.configured ? (
        <AdminStatusBanner tone="info" message={initialResult.message} />
      ) : null}

      <section className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--admin-foreground)]">Humor flavor</span>
            <select
              value={selectedFlavorId}
              onChange={(event) => setSelectedFlavorId(event.target.value)}
              className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
            >
              {flavors.map((flavor) => (
                <option key={flavor.id} value={flavor.id}>
                  {flavor.slug} (#{flavor.id})
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
              Data access layer
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
              This page is modular by design. Connect <code>src/lib/captions.ts</code> to your real caption table or view, then this UI will render newest-first caption records for the selected humor flavor.
            </p>
          </div>
        </div>
      </section>

      {filteredRecords.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface)] px-6 py-10 text-sm text-[var(--admin-muted)]">
          No caption records are available for the selected humor flavor.
        </div>
      ) : (
        <section className="space-y-4">
          {filteredRecords.map((record) => (
            <article
              key={record.id}
              className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                    Caption #{record.id}
                  </p>
                  <p className="mt-2 text-base leading-7 text-[var(--admin-foreground)]">{record.caption}</p>
                </div>
                <div className="text-sm text-[var(--admin-muted)]">
                  {record.createdAt ?? "Unknown timestamp"}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
