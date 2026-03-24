import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prompt Chain Model",
  description: "Supabase-backed admin pages for humor flavors and steps",
};

const themeScript = `
(() => {
  const key = "pcm-admin-theme";
  const root = document.documentElement;
  const stored = window.localStorage.getItem(key) || "system";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const resolved = stored === "system" ? (prefersDark ? "dark" : "light") : stored;
  root.dataset.theme = stored;
  root.style.colorScheme = resolved;
  root.classList.toggle("dark", resolved === "dark");
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--app-background)] text-[var(--app-foreground)]">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
