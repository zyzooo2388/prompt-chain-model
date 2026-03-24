import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { HumorFlavor, HumorFlavorInput } from "@/src/lib/types";

function normalizeFlavorPayload(input: HumorFlavorInput, userId: string, nowUtc: string) {
  return {
    slug: input.slug.trim(),
    description: input.description.trim() || null,
    modified_by_user_id: userId,
    modified_datetime_utc: nowUtc,
  };
}

export async function listHumorFlavors(client?: SupabaseClient) {
  const supabase = client ?? (await createSupabaseServerClient());
  const { data, error } = await supabase
    .from("humor_flavors")
    .select(
      "id, created_datetime_utc, description, slug, created_by_user_id, modified_by_user_id, modified_datetime_utc",
    )
    .order("slug", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown) as HumorFlavor[];
}

export async function getHumorFlavorById(id: number, client?: SupabaseClient) {
  const supabase = client ?? (await createSupabaseServerClient());
  const { data, error } = await supabase
    .from("humor_flavors")
    .select(
      "id, created_datetime_utc, description, slug, created_by_user_id, modified_by_user_id, modified_datetime_utc",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (((data as unknown) as HumorFlavor | null) ?? null);
}

export async function createHumorFlavor(
  input: HumorFlavorInput,
  userId: string,
  client?: SupabaseClient,
) {
  const supabase = client ?? (await createSupabaseServerClient());
  const nowUtc = new Date().toISOString();
  const payload = normalizeFlavorPayload(input, userId, nowUtc);

  const { data, error } = await supabase
    .from("humor_flavors")
    .insert({
      ...payload,
      created_by_user_id: userId,
      created_datetime_utc: nowUtc,
    })
    .select(
      "id, created_datetime_utc, description, slug, created_by_user_id, modified_by_user_id, modified_datetime_utc",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown) as HumorFlavor;
}

export async function updateHumorFlavor(
  id: number,
  input: HumorFlavorInput,
  userId: string,
  client?: SupabaseClient,
) {
  const supabase = client ?? (await createSupabaseServerClient());
  const nowUtc = new Date().toISOString();
  const { data, error } = await supabase
    .from("humor_flavors")
    .update(normalizeFlavorPayload(input, userId, nowUtc))
    .eq("id", id)
    .select(
      "id, created_datetime_utc, description, slug, created_by_user_id, modified_by_user_id, modified_datetime_utc",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown) as HumorFlavor;
}

export async function deleteHumorFlavor(id: number, client?: SupabaseClient) {
  const supabase = client ?? (await createSupabaseServerClient());
  const { error } = await supabase.from("humor_flavors").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
