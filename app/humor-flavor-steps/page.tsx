import { HumorFlavorStepManager } from "@/src/components/humor-flavor-steps/humor-flavor-step-manager";

export default function HumorFlavorStepsPage() {
  return (
    <main className="min-h-screen bg-zinc-100 px-6 py-12 text-zinc-950">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Supabase Admin
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Humor Flavor Steps
          </h1>
          <p className="max-w-2xl text-base text-zinc-600">
            Manage the ordered steps attached to each humor flavor.
          </p>
        </header>

        <HumorFlavorStepManager />
      </div>
    </main>
  );
}
