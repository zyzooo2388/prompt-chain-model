"use server";

import { requireAdmin } from "@/src/lib/auth";
import {
  createHumorFlavor,
  deleteHumorFlavor,
  listHumorFlavors,
  updateHumorFlavor,
} from "@/src/lib/humor-flavors";
import {
  createHumorFlavorStep,
  deleteHumorFlavorStep,
  listHumorFlavorStepsWithFlavor,
  reorderHumorFlavorStep,
  updateHumorFlavorStep,
} from "@/src/lib/humor-flavor-steps";
import type { ActionResult, HumorFlavor, HumorFlavorInput, HumorFlavorStepInput, HumorFlavorStepWithFlavor } from "@/src/lib/types";

function validateFlavorInput(input: HumorFlavorInput) {
  if (!input.slug.trim()) {
    throw new Error("Slug is required.");
  }
}

function validateStepInput(input: HumorFlavorStepInput) {
  if (!Number.isInteger(input.humor_flavor_id) || input.humor_flavor_id <= 0) {
    throw new Error("Select a humor flavor.");
  }

  if (!Number.isInteger(input.humor_flavor_step_type_id) || input.humor_flavor_step_type_id <= 0) {
    throw new Error("Enter a valid humor flavor step type id.");
  }

  if (!Number.isInteger(input.llm_model_id) || input.llm_model_id <= 0) {
    throw new Error("Enter a valid llm model id.");
  }

  if (!Number.isInteger(input.llm_input_type_id) || input.llm_input_type_id <= 0) {
    throw new Error("Enter a valid llm input type id.");
  }

  if (!Number.isInteger(input.llm_output_type_id) || input.llm_output_type_id <= 0) {
    throw new Error("Enter a valid llm output type id.");
  }

  if (!Number.isFinite(input.llm_temperature)) {
    throw new Error("Enter a valid llm temperature.");
  }

  if (input.order_by < 1) {
    throw new Error("order_by must be at least 1.");
  }
}

export async function saveHumorFlavorAction(
  id: number | null,
  input: HumorFlavorInput,
): Promise<ActionResult<HumorFlavor[]>> {
  try {
    const { user } = await requireAdmin("/admin/humor-flavors");
    validateFlavorInput(input);

    if (id) {
      await updateHumorFlavor(id, input, user.id);
    } else {
      await createHumorFlavor(input, user.id);
    }

    return {
      ok: true,
      message: id ? "Humor flavor updated." : "Humor flavor created.",
      data: await listHumorFlavors(),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save humor flavor.",
    };
  }
}

export async function deleteHumorFlavorAction(id: number): Promise<ActionResult<HumorFlavor[]>> {
  try {
    await requireAdmin("/admin/humor-flavors");
    await deleteHumorFlavor(id);

    return {
      ok: true,
      message: "Humor flavor deleted.",
      data: await listHumorFlavors(),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not delete humor flavor.",
    };
  }
}

export async function saveHumorFlavorStepAction(
  id: number | null,
  input: HumorFlavorStepInput,
): Promise<ActionResult<HumorFlavorStepWithFlavor[]>> {
  try {
    const { user } = await requireAdmin("/admin/humor-flavor-steps");
    validateStepInput(input);

    if (id) {
      await updateHumorFlavorStep(id, input, user.id);
    } else {
      await createHumorFlavorStep(input, user.id);
    }

    return {
      ok: true,
      message: id ? "Humor flavor step updated." : "Humor flavor step created.",
      data: await listHumorFlavorStepsWithFlavor(),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not save humor flavor step.",
    };
  }
}

export async function deleteHumorFlavorStepAction(
  id: number,
): Promise<ActionResult<HumorFlavorStepWithFlavor[]>> {
  try {
    const { user } = await requireAdmin("/admin/humor-flavor-steps");
    await deleteHumorFlavorStep(id, user.id);

    return {
      ok: true,
      message: "Humor flavor step deleted.",
      data: await listHumorFlavorStepsWithFlavor(),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not delete humor flavor step.",
    };
  }
}

export async function reorderHumorFlavorStepAction(
  id: number,
  direction: "up" | "down",
): Promise<ActionResult<HumorFlavorStepWithFlavor[]>> {
  try {
    const { user } = await requireAdmin("/admin/humor-flavor-steps");
    await reorderHumorFlavorStep(id, direction, user.id);

    return {
      ok: true,
      message: `Step moved ${direction}.`,
      data: await listHumorFlavorStepsWithFlavor(),
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not reorder humor flavor step.",
    };
  }
}
