import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/src/components/auth/google-sign-in-button";
import {
  ACCESS_DENIED_PATH,
  AUTHORIZED_HOME_PATH,
  getCurrentProfile,
  getCurrentUser,
  hasAdminAccess,
} from "@/src/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;
  const user = await getCurrentUser();

  if (user) {
    const profile = await getCurrentProfile(user.id);
    redirect(hasAdminAccess(profile) ? AUTHORIZED_HOME_PATH : ACCESS_DENIED_PATH);
  }

  const errorMessage =
    error === "auth_callback_failed"
      ? "We could not complete sign-in. Check your Supabase Google provider and redirect URL settings."
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#fff8ef,_#efe5d1_55%,_#d9ccb6)] px-6 py-12 text-stone-950">
      <div className="w-full max-w-md rounded-[2rem] border border-stone-300/70 bg-white/90 p-8 shadow-[0_35px_120px_-55px_rgba(68,64,60,0.45)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.32em] text-stone-500">
          Admin Sign In
        </p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight text-stone-950">
          Restricted workspace
        </h1>
        <p className="mt-4 text-base leading-7 text-stone-600">
          Sign in with Google to continue. Access is limited to users whose
          profile is marked as a superadmin or matrix admin.
        </p>

        <GoogleSignInButton />

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <p className="mt-6 text-sm text-stone-500">
          If the signed-in account is not authorized, you can sign out from the
          access denied screen and try another one.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 transition hover:text-stone-950"
        >
          Return to home
        </Link>
      </div>
    </main>
  );
}
