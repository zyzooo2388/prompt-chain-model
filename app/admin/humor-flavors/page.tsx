import { HumorFlavorsManager } from "@/src/components/admin/humor-flavors-manager";
import { requireAdmin } from "@/src/lib/auth";
import { listHumorFlavors } from "@/src/lib/humor-flavors";

export default async function AdminHumorFlavorsPage() {
  await requireAdmin("/admin/humor-flavors");
  const flavors = await listHumorFlavors();

  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
          Supabase Admin
        </p>
        <h1 className="font-serif text-4xl tracking-tight text-[var(--admin-foreground)]">
          Humor Flavors
        </h1>
        <p className="max-w-2xl text-base text-[var(--admin-muted)]">
          Manage flavor records with create, edit, delete, and refresh actions.
        </p>
      </header>

      <HumorFlavorsManager initialFlavors={flavors} />
    </main>
  );
}
