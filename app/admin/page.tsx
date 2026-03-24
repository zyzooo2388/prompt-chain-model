import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth";

export default async function AdminPage() {
  const { user, profile } = await requireAdmin("/admin");

  return (
    <main className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-stone-300/70 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
            Access
          </p>
          <h2 className="mt-4 font-serif text-4xl tracking-tight text-stone-950">
            Admin access confirmed
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600">
            This workspace is limited to approved administrators. Your current
            session can manage humor flavors and ordered humor flavor steps.
          </p>
        </div>

        <div className="rounded-[2rem] border border-stone-300/70 bg-stone-950 p-8 text-stone-50 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-300">
            Signed In
          </p>
          <dl className="mt-6 space-y-4">
            <div>
              <dt className="text-sm text-stone-300">Email</dt>
              <dd className="text-lg font-medium">{user.email ?? "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-sm text-stone-300">Superadmin</dt>
              <dd>{profile?.is_superadmin ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-sm text-stone-300">Matrix admin</dt>
              <dd>{profile?.is_matrix_admin ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Link
          href="/admin/humor-flavors"
          className="rounded-[2rem] border border-stone-300/70 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
            Table
          </p>
          <h3 className="mt-4 font-serif text-3xl tracking-tight text-stone-950">
            Humor Flavors
          </h3>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Create, edit, and organize rows from the
            <code className="mx-1 rounded bg-stone-100 px-2 py-1 text-sm">
              humor_flavor
            </code>
            table.
          </p>
        </Link>

        <Link
          href="/admin/humor-flavor-steps"
          className="rounded-[2rem] border border-stone-300/70 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
            Table
          </p>
          <h3 className="mt-4 font-serif text-3xl tracking-tight text-stone-950">
            Humor Flavor Steps
          </h3>
          <p className="mt-3 text-base leading-7 text-stone-600">
            Manage ordered step definitions with joined flavor details from the
            <code className="mx-1 rounded bg-stone-100 px-2 py-1 text-sm">
              humor_flavor_step
            </code>
            table.
          </p>
        </Link>
      </section>
    </main>
  );
}
