"use client";

import { useState, useTransition } from "react";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

type SignOutButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSignOut() {
    setErrorMessage(null);

    const { error } = await createSupabaseBrowserClient().auth.signOut({
      scope: "global",
    });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    window.location.replace("/login");
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        className={className}
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            void handleSignOut();
          });
        }}
      >
        {isPending ? "Signing out..." : (children ?? "Sign out")}
      </button>

      {errorMessage ? (
        <p className="text-sm text-red-700">{errorMessage}</p>
      ) : null}
    </div>
  );
}
