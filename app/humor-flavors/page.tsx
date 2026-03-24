import { HumorFlavorManager } from "@/src/components/humor-flavors/humor-flavor-manager";

export default function HumorFlavorsPage() {
  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-12 text-zinc-950">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Supabase Admin
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">Humor Flavors</h1>
          <p className="max-w-2xl text-base text-zinc-600">
            Manage flavor records with create, edit, delete, and refresh actions.
          </p>
        </header>

        <HumorFlavorManager />
      </div>
    </main>
  );
}
