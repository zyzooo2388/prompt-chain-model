import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type Profile = {
  id: string;
  is_superadmin: boolean | null;
  is_matrix_admin: boolean | null;
};

export type AdminContext = {
  user: User;
  profile: Profile | null;
};

export const AUTHORIZED_HOME_PATH = "/flavors";
export const ACCESS_DENIED_PATH = "/access-denied";

export function normalizeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return AUTHORIZED_HOME_PATH;
  }

  return value;
}

export function hasAdminAccess(profile: Profile | null) {
  return Boolean(profile?.is_superadmin || profile?.is_matrix_admin);
}

export function buildLoginRedirect(nextPath: string) {
  const params = new URLSearchParams({
    next: normalizeNextPath(nextPath),
  });

  return `/login?${params.toString()}`;
}

export async function getCurrentUser(supabase?: SupabaseClient) {
  const client = supabase ?? (await createSupabaseServerClient());
  const {
    data: { user },
  } = await client.auth.getUser();

  return user;
}

export async function getCurrentProfile(
  userId?: string,
  supabase?: SupabaseClient,
): Promise<Profile | null> {
  const client = supabase ?? (await createSupabaseServerClient());
  const resolvedUserId = userId ?? (await getCurrentUser(client))?.id;

  if (!resolvedUserId) {
    return null;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, is_superadmin, is_matrix_admin")
    .eq("id", resolvedUserId)
    .maybeSingle();

  if (error) {
    return null;
  }

  return (data as Profile | null) ?? null;
}

export async function requireAdmin(nextPath = "/admin"): Promise<AdminContext> {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect(buildLoginRedirect(nextPath));
  }

  const profile = await getCurrentProfile(user.id, supabase);

  if (!hasAdminAccess(profile)) {
    redirect(`${ACCESS_DENIED_PATH}?reason=not_admin`);
  }

  return { user, profile };
}
