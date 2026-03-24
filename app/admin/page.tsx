import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth";

export default async function AdminPage() {
  const { user, profile } = await requireAdmin("/admin");

  return (
    <main className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            Access
          </p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight text-[var(--admin-foreground)]">
            Admin access confirmed
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--admin-muted)]">
            This workspace is limited to approved administrators. Your current session can manage humor flavors, ordered humor flavor steps, and caption testing workflows.
          </p>
        </div>

        <div className="rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            Signed In
          </p>
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-sm text-[var(--admin-muted)]">Email</dt>
              <dd className="text-lg font-medium text-[var(--admin-foreground)]">{user.email ?? "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--admin-muted)]">Superadmin</dt>
              <dd className="text-[var(--admin-foreground)]">{profile?.is_superadmin ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-sm text-[var(--admin-muted)]">Matrix admin</dt>
              <dd className="text-[var(--admin-foreground)]">{profile?.is_matrix_admin ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/humor-flavors"
          className="rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            Table
          </p>
          <h3 className="mt-4 font-serif text-3xl tracking-tight text-[var(--admin-foreground)]">
            Humor Flavors
          </h3>
          <p className="mt-3 text-base leading-7 text-[var(--admin-muted)]">
            Create, edit, and organize rows from the
            <code className="mx-1 rounded bg-[var(--admin-surface-strong)] px-2 py-1 text-sm">
              humor_flavors
            </code>
            table.
          </p>
        </Link>

        <Link
          href="/admin/humor-flavor-steps"
          className="rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            Table
          </p>
          <h3 className="mt-4 font-serif text-3xl tracking-tight text-[var(--admin-foreground)]">
            Humor Flavor Steps
          </h3>
          <p className="mt-3 text-base leading-7 text-[var(--admin-muted)]">
            Manage ordered step definitions with joined flavor details from the
            <code className="mx-1 rounded bg-[var(--admin-surface-strong)] px-2 py-1 text-sm">
              humor_flavor_steps
            </code>
            table.
          </p>
        </Link>

        <Link
          href="/admin/test-caption-pipeline"
          className="rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            Testing
          </p>
          <h3 className="mt-4 font-serif text-3xl tracking-tight text-[var(--admin-foreground)]">
            Test Caption Pipeline
          </h3>
          <p className="mt-3 text-base leading-7 text-[var(--admin-muted)]">
            Upload an image, run the full REST flow, and inspect generated captions step by step.
          </p>
        </Link>

        <Link
          href="/admin/captions"
          className="rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--admin-muted)]">
            Output
          </p>
          <h3 className="mt-4 font-serif text-3xl tracking-tight text-[var(--admin-foreground)]">
            Captions
          </h3>
          <p className="mt-3 text-base leading-7 text-[var(--admin-muted)]">
            Inspect caption output per humor flavor through a modular data access layer.
          </p>
        </Link>
      </section>
    </main>
  );
}
