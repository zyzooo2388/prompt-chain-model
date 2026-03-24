import Link from "next/link";
import { requireAdmin } from "@/src/lib/auth";
import { SignOutButton } from "@/src/components/auth/sign-out-button";
import { ThemeToggle } from "@/src/components/theme-toggle";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/humor-flavors", label: "Humor Flavors" },
  { href: "/admin/humor-flavor-steps", label: "Humor Flavor Steps" },
  { href: "/admin/test-caption-pipeline", label: "Test Pipeline" },
  { href: "/admin/captions", label: "Captions" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await requireAdmin("/admin");

  return (
    <div className="min-h-screen text-[var(--admin-foreground)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        <header className="rounded-[2rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-[0_24px_80px_-40px_rgba(49,35,16,0.5)] backdrop-blur">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-muted)]">
                Admin Console
              </p>
              <h1 className="font-serif text-3xl tracking-tight text-[var(--admin-foreground)]">
                Prompt Chain Model
              </h1>
              <p className="text-sm text-[var(--admin-muted)]">
                {user.email ?? "Unknown"} · superadmin {profile?.is_superadmin ? "yes" : "no"} · matrix admin{" "}
                {profile?.is_matrix_admin ? "yes" : "no"}
              </p>
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex flex-wrap items-center gap-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-2 text-sm font-medium text-[var(--admin-foreground)] transition hover:-translate-y-0.5 hover:bg-[var(--admin-surface)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ThemeToggle />
                <SignOutButton className="rounded-full bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90" />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 py-8">{children}</div>
      </div>
    </div>
  );
}
