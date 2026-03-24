import { HumorFlavorStepManager } from "@/src/components/humor-flavor-steps/humor-flavor-step-manager";
import { requireAdmin } from "@/src/lib/auth";

export default async function AdminHumorFlavorStepsPage() {
  await requireAdmin("/admin/humor-flavor-steps");

  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
          Supabase Admin
        </p>
        <h1 className="font-serif text-4xl tracking-tight text-stone-950">
          Humor Flavor Steps
        </h1>
        <p className="max-w-2xl text-base text-stone-600">
          Manage the ordered steps attached to each humor flavor.
        </p>
      </header>

      <HumorFlavorStepManager />
    </main>
  );
}
