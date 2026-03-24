import { HumorFlavorManager } from "@/src/components/humor-flavors/humor-flavor-manager";
import { requireAdmin } from "@/src/lib/auth";

export default async function AdminHumorFlavorsPage() {
  await requireAdmin("/admin/humor-flavors");

  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
          Supabase Admin
        </p>
        <h1 className="font-serif text-4xl tracking-tight text-stone-950">
          Humor Flavors
        </h1>
        <p className="max-w-2xl text-base text-stone-600">
          Manage flavor records with create, edit, delete, and refresh actions.
        </p>
      </header>

      <HumorFlavorManager />
    </main>
  );
}
