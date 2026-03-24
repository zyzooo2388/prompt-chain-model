import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff,_#e4e4e7_55%,_#d4d4d8)] px-6 py-12 text-zinc-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="max-w-2xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Prompt Chain Model
          </p>
          <h1 className="text-5xl font-semibold tracking-tight text-zinc-950">
            Supabase admin pages for humor flavor data.
          </h1>
          <p className="text-lg leading-8 text-zinc-600">
            Use the links below to manage humor flavors and the ordered steps
            that belong to each flavor.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <Link
            href="/humor-flavors"
            className="group rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Page One
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Humor Flavors
            </h2>
            <p className="mt-3 text-base leading-7 text-zinc-600">
              Browse, add, edit, and delete records from the
              <code className="mx-1 rounded bg-zinc-100 px-2 py-1 text-sm">
                humor_flavor
              </code>
              table.
            </p>
            <span className="mt-8 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">
              Open flavors
            </span>
          </Link>

          <Link
            href="/humor-flavor-steps"
            className="group rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Page Two
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Humor Flavor Steps
            </h2>
            <p className="mt-3 text-base leading-7 text-zinc-600">
              Manage ordered step records from the
              <code className="mx-1 rounded bg-zinc-100 px-2 py-1 text-sm">
                humor_flavor_step
              </code>
              table with joined flavor names.
            </p>
            <span className="mt-8 inline-flex rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">
              Open steps
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
