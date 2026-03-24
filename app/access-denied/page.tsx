import { redirect } from "next/navigation";
import {
  AUTHORIZED_HOME_PATH,
  getCurrentProfile,
  getCurrentUser,
  hasAdminAccess,
} from "@/src/lib/auth";
import { SignOutButton } from "@/src/components/auth/sign-out-button";

type AccessDeniedPageProps = {
  searchParams: Promise<{
    reason?: string | string[];
  }>;
};

function getReasonMessage(reason: string | undefined) {
  if (reason === "missing_profile") {
    return "No matching profile record was found for this signed-in account.";
  }

  if (reason === "not_admin") {
    return "Your profile is signed in, but it is not marked as a superadmin or matrix admin.";
  }

  return null;
}

export default async function AccessDeniedPage({
  searchParams,
}: AccessDeniedPageProps) {
  const params = await searchParams;
  const reason = Array.isArray(params.reason) ? params.reason[0] : params.reason;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentProfile(user.id);

  if (hasAdminAccess(profile)) {
    redirect(AUTHORIZED_HOME_PATH);
  }

  const reasonMessage = getReasonMessage(reason);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f4efe6_0%,_#e8ddcd_100%)] px-6 py-12 text-stone-950">
      <div className="w-full max-w-lg rounded-[2rem] border border-stone-300/70 bg-white p-8 shadow-[0_35px_120px_-55px_rgba(68,64,60,0.45)]">
        <h1 className="font-serif text-4xl tracking-tight text-stone-950">
          Access Denied
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          This account is signed in, but does not have permission to use this
          workspace.
        </p>
        <p className="mt-3 text-sm text-stone-500">
          Signed in as <strong>{user.email ?? "an unknown user"}</strong>.
        </p>
        {reasonMessage ? (
          <p className="mt-3 text-sm text-stone-500">{reasonMessage}</p>
        ) : null}
        <p className="mt-3 text-sm text-stone-500">
          Only users with <code>profiles.is_superadmin = true</code> or{" "}
          <code>profiles.is_matrix_admin = true</code> can continue.
        </p>

        <div className="mt-8">
          <SignOutButton className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70">
            Sign out and try another account
          </SignOutButton>
        </div>
      </div>
    </main>
  );
}
