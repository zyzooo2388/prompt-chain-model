import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_DENIED_PATH,
  AUTHORIZED_HOME_PATH,
  getCurrentProfile,
  getCurrentUser,
  hasAdminAccess,
} from "@/src/lib/auth";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        new URL("/login?error=auth_callback_failed", request.url),
      );
    }

    const user = await getCurrentUser(supabase);
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const profile = await getCurrentProfile(user.id, supabase);
    if (!profile) {
      return NextResponse.redirect(
        new URL(`${ACCESS_DENIED_PATH}?reason=missing_profile`, request.url),
      );
    }

    const destination = hasAdminAccess(profile)
      ? AUTHORIZED_HOME_PATH
      : `${ACCESS_DENIED_PATH}?reason=not_admin`;

    return NextResponse.redirect(new URL(destination, request.url));
  } catch {
    return NextResponse.redirect(
      new URL("/login?error=auth_callback_failed", request.url),
    );
  }
}
