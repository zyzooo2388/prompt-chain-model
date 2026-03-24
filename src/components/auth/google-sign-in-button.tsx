"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

export function GoogleSignInButton() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(() => {
      void signInWithGoogle();
    });
  };

  async function signInWithGoogle() {
    setErrorMessage(null);

    const redirectTo = `${window.location.origin}/auth/callback`;

    const { data, error } = await createSupabaseBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "select_account",
        },
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (!data.url) {
      setErrorMessage("Google sign-in did not return a redirect URL.");
      return;
    }

    window.location.assign(data.url);
  }

  return (
    <div className="mt-8 space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? "Redirecting to Google..." : "Sign in with Google"}
      </button>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
