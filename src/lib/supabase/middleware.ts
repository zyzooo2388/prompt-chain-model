import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  ACCESS_DENIED_PATH,
  AUTHORIZED_HOME_PATH,
  buildLoginRedirect,
  getCurrentProfile,
  hasAdminAccess,
  normalizeNextPath,
} from "@/src/lib/auth";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/src/lib/supabase/config";

const ADMIN_PATH_PREFIX = "/admin";
const LOGIN_PATH = "/login";
const CALLBACK_PATH = "/auth/callback";

function isAdminPath(pathname: string) {
  return pathname === ADMIN_PATH_PREFIX || pathname.startsWith(`${ADMIN_PATH_PREFIX}/`);
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie);
  });

  return to;
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;

  if (pathname === CALLBACK_PATH) {
    return response;
  }

  const requestedPath = normalizeNextPath(`${pathname}${search}`);

  if (isAdminPath(pathname) && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.search = "";
    loginUrl.searchParams.set("next", requestedPath);
    return copyCookies(response, NextResponse.redirect(loginUrl));
  }

  const needsRoleCheck =
    Boolean(user) &&
    (isAdminPath(pathname) || pathname === LOGIN_PATH || pathname === ACCESS_DENIED_PATH);

  const profile = needsRoleCheck ? await getCurrentProfile(user?.id, supabase) : null;
  const isAdmin = hasAdminAccess(profile);

  if (isAdminPath(pathname) && user && !isAdmin) {
    const deniedUrl = request.nextUrl.clone();
    deniedUrl.pathname = ACCESS_DENIED_PATH;
    deniedUrl.search = "";
    return copyCookies(response, NextResponse.redirect(deniedUrl));
  }

  if (pathname === LOGIN_PATH && user) {
    const destination = isAdmin ? AUTHORIZED_HOME_PATH : ACCESS_DENIED_PATH;
    return copyCookies(response, NextResponse.redirect(new URL(destination, request.url)));
  }

  if (pathname === ACCESS_DENIED_PATH) {
    if (!user) {
      return copyCookies(
        response,
        NextResponse.redirect(new URL(buildLoginRedirect(AUTHORIZED_HOME_PATH), request.url)),
      );
    }

    if (isAdmin) {
      return copyCookies(
        response,
        NextResponse.redirect(new URL(AUTHORIZED_HOME_PATH, request.url)),
      );
    }
  }

  return response;
}
