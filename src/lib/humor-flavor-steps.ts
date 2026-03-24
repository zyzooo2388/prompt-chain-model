import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type {
  HumorFlavor,
  HumorFlavorStep,
  HumorFlavorStepInput,
  HumorFlavorStepWithFlavor,
} from "@/src/lib/types";

const STEP_COLUMNS = [
  "id",
  "created_datetime_utc",
  "humor_flavor_id",
  "llm_temperature",
  "order_by",
  "llm_input_type_id",
  "llm_output_type_id",
  "llm_model_id",
  "humor_flavor_step_type_id",
  "llm_system_prompt",
  "llm_user_prompt",
  "description",
  "created_by_user_id",
  "modified_by_user_id",
  "modified_datetime_utc",
].join(", ");

function createStepPayload(input: HumorFlavorStepInput, userId: string, nowUtc: string) {
  return {
    humor_flavor_id: input.humor_flavor_id,
    llm_temperature: input.llm_temperature,
    order_by: input.order_by,
    llm_input_type_id: input.llm_input_type_id,
    llm_output_type_id: input.llm_output_type_id,
    llm_model_id: input.llm_model_id,
    humor_flavor_step_type_id: input.humor_flavor_step_type_id,
    llm_system_prompt: input.llm_system_prompt.trim() || null,
    llm_user_prompt: input.llm_user_prompt.trim() || null,
    description: input.description.trim() || null,
    modified_by_user_id: userId,
    modified_datetime_utc: nowUtc,
  };
}

function clampOrder(order: number, totalCount: number) {
  if (Number.isNaN(order)) {
    return 1;
  }

  return Math.max(1, Math.min(order, totalCount));
}

async function fetchFlavorSteps(flavorId: number, client: SupabaseClient) {
  const { data, error } = await client
    .from("humor_flavor_steps")
    .select(STEP_COLUMNS)
    .eq("humor_flavor_id", flavorId)
    .order("order_by", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown) as HumorFlavorStep[];
}

async function renumberFlavorSteps(
  flavorId: number,
  orderedIds: number[],
  userId: string,
  client: SupabaseClient,
) {
  if (orderedIds.length === 0) {
    return;
  }

  const nowUtc = new Date().toISOString();
  for (const [index, id] of orderedIds.entries()) {
    const { error } = await client
      .from("humor_flavor_steps")
      .update({
        order_by: 1000000 + index + 1,
        modified_by_user_id: userId,
        modified_datetime_utc: nowUtc,
      })
      .eq("id", id)
      .eq("humor_flavor_id", flavorId);

    if (error) {
      throw new Error(error.message);
    }
  }

  for (const [index, id] of orderedIds.entries()) {
    const { error } = await client
      .from("humor_flavor_steps")
      .update({
        order_by: index + 1,
        modified_by_user_id: userId,
        modified_datetime_utc: nowUtc,
      })
      .eq("id", id)
      .eq("humor_flavor_id", flavorId);

    if (error) {
      throw new Error(error.message);
    }
  }
}

export async function listHumorFlavorSteps(client?: SupabaseClient) {
  const supabase = client ?? (await createSupabaseServerClient());
  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .select(STEP_COLUMNS)
    .order("humor_flavor_id", { ascending: true })
    .order("order_by", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown) as HumorFlavorStep[];
}

export async function listHumorFlavorStepsWithFlavor(client?: SupabaseClient) {
  const supabase = client ?? (await createSupabaseServerClient());
  const [steps, flavors] = await Promise.all([
    listHumorFlavorSteps(supabase),
    supabase
      .from("humor_flavors")
      .select(
        "id, created_datetime_utc, description, slug, created_by_user_id, modified_by_user_id, modified_datetime_utc",
      )
      .order("slug", { ascending: true }),
  ]);

  if (flavors.error) {
    throw new Error(flavors.error.message);
  }

  const flavorMap = new Map<number, HumorFlavor>();
  for (const flavor of ((flavors.data ?? []) as unknown) as HumorFlavor[]) {
    flavorMap.set(flavor.id, flavor);
  }

  return (steps.map((step) => ({
    ...step,
    humorFlavor: flavorMap.get(step.humor_flavor_id) ?? null,
  })) as unknown) as HumorFlavorStepWithFlavor[];
}

export async function createHumorFlavorStep(
  input: HumorFlavorStepInput,
  userId: string,
  client?: SupabaseClient,
) {
  const supabase = client ?? (await createSupabaseServerClient());
  const nowUtc = new Date().toISOString();
  const currentSteps = await fetchFlavorSteps(input.humor_flavor_id, supabase);
  const insertIndex = clampOrder(input.order_by, currentSteps.length + 1) - 1;
  const payload = createStepPayload(
    {
      ...input,
      order_by: currentSteps.length + 1,
    },
    userId,
    nowUtc,
  );

  const { data, error } = await supabase
    .from("humor_flavor_steps")
    .insert({
      ...payload,
      created_by_user_id: userId,
      created_datetime_utc: nowUtc,
    })
    .select(STEP_COLUMNS)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const orderedIds = currentSteps.map((step) => step.id);
  orderedIds.splice(insertIndex, 0, ((data as unknown) as HumorFlavorStep).id);
  await renumberFlavorSteps(input.humor_flavor_id, orderedIds, userId, supabase);

  return (data as unknown) as HumorFlavorStep;
}

export async function updateHumorFlavorStep(
  id: number,
  input: HumorFlavorStepInput,
  userId: string,
  client?: SupabaseClient,
) {
  const supabase = client ?? (await createSupabaseServerClient());
  const nowUtc = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from("humor_flavor_steps")
    .select(STEP_COLUMNS)
    .eq("id", id)
    .single();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const currentStep = (existing as unknown) as HumorFlavorStep;
  const oldFlavorId = currentStep.humor_flavor_id;
  const newFlavorId = input.humor_flavor_id;

  const { error } = await supabase
    .from("humor_flavor_steps")
    .update({
      ...createStepPayload(
        {
          ...input,
          order_by: 1000000,
        },
        userId,
        nowUtc,
      ),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  if (oldFlavorId === newFlavorId) {
    const ordered = (await fetchFlavorSteps(newFlavorId, supabase))
      .filter((step) => step.id !== id)
      .map((step) => step.id);
    const insertIndex = clampOrder(input.order_by, ordered.length + 1) - 1;
    ordered.splice(insertIndex, 0, id);
    await renumberFlavorSteps(newFlavorId, ordered, userId, supabase);
  } else {
    const oldOrdered = (await fetchFlavorSteps(oldFlavorId, supabase))
      .filter((step) => step.id !== id)
      .map((step) => step.id);
    await renumberFlavorSteps(oldFlavorId, oldOrdered, userId, supabase);

    const newOrdered = (await fetchFlavorSteps(newFlavorId, supabase))
      .filter((step) => step.id !== id)
      .map((step) => step.id);
    const insertIndex = clampOrder(input.order_by, newOrdered.length + 1) - 1;
    newOrdered.splice(insertIndex, 0, id);
    await renumberFlavorSteps(newFlavorId, newOrdered, userId, supabase);
  }
}

export async function deleteHumorFlavorStep(
  id: number,
  userId: string,
  client?: SupabaseClient,
) {
  const supabase = client ?? (await createSupabaseServerClient());
  const { data: existing, error: existingError } = await supabase
    .from("humor_flavor_steps")
    .select("id, humor_flavor_id")
    .eq("id", id)
    .single();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const flavorId = ((existing as unknown) as Pick<HumorFlavorStep, "id" | "humor_flavor_id">)
    .humor_flavor_id;
  const { error } = await supabase.from("humor_flavor_steps").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  const remainingIds = (await fetchFlavorSteps(flavorId, supabase)).map((step) => step.id);
  await renumberFlavorSteps(flavorId, remainingIds, userId, supabase);
}

export async function reorderHumorFlavorStep(
  id: number,
  direction: "up" | "down",
  userId: string,
  client?: SupabaseClient,
) {
  const supabase = client ?? (await createSupabaseServerClient());
  const { data: existing, error: existingError } = await supabase
    .from("humor_flavor_steps")
    .select("id, humor_flavor_id")
    .eq("id", id)
    .single();

  if (existingError) {
    throw new Error(existingError.message);
  }

  const flavorId = ((existing as unknown) as Pick<HumorFlavorStep, "id" | "humor_flavor_id">)
    .humor_flavor_id;
  const orderedIds = (await fetchFlavorSteps(flavorId, supabase)).map((step) => step.id);
  const currentIndex = orderedIds.indexOf(id);

  if (currentIndex === -1) {
    throw new Error("Step not found in its flavor sequence.");
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= orderedIds.length) {
    return;
  }

  const nextIds = [...orderedIds];
  [nextIds[currentIndex], nextIds[targetIndex]] = [nextIds[targetIndex], nextIds[currentIndex]];
  await renumberFlavorSteps(flavorId, nextIds, userId, supabase);
}
