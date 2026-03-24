import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth";
import { SignOutButton } from "@/src/components/auth/sign-out-button";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/humor-flavors", label: "Humor Flavors" },
  { href: "/admin/humor-flavor-steps", label: "Humor Flavor Steps" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdmin("/admin");

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f5f1e8_0%,_#ece6da_100%)] text-stone-950">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <header className="rounded-[2rem] border border-stone-300/70 bg-white/80 p-6 shadow-[0_24px_80px_-40px_rgba(68,64,60,0.45)] backdrop-blur">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-stone-500">
                Admin Console
              </p>
              <h1 className="font-serif text-3xl tracking-tight text-stone-950">
                Prompt Chain Model
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
                >
                  {item.label}
                </Link>
              ))}

              <SignOutButton className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800" />
            </div>
          </div>
        </header>

        <div className="flex-1 py-8">{children}</div>
      </div>
    </div>
  );
}
