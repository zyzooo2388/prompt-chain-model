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
            Sign in with an authorized Google account to reach the protected
            admin workspace for humor flavor data.
          </p>
        </header>

        <section className="max-w-md">
          <Link
            href="/login"
            className="group rounded-[2rem] border border-zinc-200 bg-zinc-950 p-8 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300">
              Access
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight">
              Admin Login
            </h2>
            <p className="mt-3 text-base leading-7 text-zinc-200">
              Sign in with Google and continue to the protected admin console.
            </p>
            <span className="mt-8 inline-flex rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950">
              Open login
            </span>
          </Link>
        </section>
      </div>
    </main>
  );
}
