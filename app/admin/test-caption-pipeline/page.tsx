import { CaptionPipelineTester } from "@/src/components/admin/caption-pipeline-tester";
import { requireAdmin } from "@/src/lib/auth";
import { listHumorFlavors } from "@/src/lib/humor-flavors";
import { listHumorFlavorStepsWithFlavor } from "@/src/lib/humor-flavor-steps";

export default async function AdminTestCaptionPipelinePage() {
  await requireAdmin("/admin/test-caption-pipeline");
  const [flavors, steps] = await Promise.all([listHumorFlavors(), listHumorFlavorStepsWithFlavor()]);

  return (
    <main className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--admin-muted)]">
          Admin Testing
        </p>
        <h1 className="font-serif text-4xl tracking-tight text-[var(--admin-foreground)]">
          Test Caption Pipeline
        </h1>
        <p className="max-w-3xl text-base text-[var(--admin-muted)]">
          Select a humor flavor, review its ordered steps, upload an image, and run the external caption generation REST workflow with the logged-in user session.
        </p>
      </header>

      <CaptionPipelineTester
        flavors={flavors.map((flavor) => ({ id: flavor.id, slug: flavor.slug }))}
        steps={steps}
      />
    </main>
  );
}
