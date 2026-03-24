import type { CaptionBrowserResult } from "@/src/lib/types";

export async function listCaptionsForFlavor(humorFlavorId?: number): Promise<CaptionBrowserResult> {
  return {
    configured: false,
    message:
      `No caption table is wired in this codebase yet. Connect src/lib/captions.ts to your real caption source when that table or view is confirmed${humorFlavorId ? ` for humor flavor ${humorFlavorId}` : ""}.`,
    records: [],
  };
}
