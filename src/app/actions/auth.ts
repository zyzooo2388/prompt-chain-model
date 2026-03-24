"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  await supabase.auth.signOut({ scope: "global" });
  redirect("/login");
}
