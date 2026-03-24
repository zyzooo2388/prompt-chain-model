import { CaptionsBrowser } from "@/src/components/admin/captions-browser";
import { requireAdmin } from "@/src/lib/auth";
import { listCaptionsForFlavor } from "@/src/lib/captions";
import { listHumorFlavors } from "@/src/lib/humor-flavors";

export default async function AdminCaptionsPage() {
  await requireAdmin("/admin/captions");
  const flavors = await listHumorFlavors();
  const initialFlavorId = flavors[0]?.id;
  const captions = await listCaptionsForFlavor(initialFlavorId);

  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
          Admin Output
        </p>
        <h1 className="font-serif text-4xl tracking-tight text-[var(--admin-foreground)]">
          Captions
        </h1>
        <p className="max-w-3xl text-base text-[var(--admin-muted)]">
          Inspect caption output for a selected humor flavor. This page is ready to attach to the real caption table once that source is confirmed in the codebase.
        </p>
      </header>

      <CaptionsBrowser
        flavors={flavors.map((flavor) => ({ id: flavor.id, slug: flavor.slug }))}
        initialResult={captions}
      />
    </main>
  );
}
