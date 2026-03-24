export type ThemeMode = "light" | "dark" | "system";

export type AdminStatusTone = "success" | "error" | "loading" | "info";

export type HumorFlavor = {
  id: number;
  created_datetime_utc: string | null;
  description: string | null;
  slug: string;
  created_by_user_id: string | null;
  modified_by_user_id: string | null;
  modified_datetime_utc: string | null;
};

export type HumorFlavorStep = {
  id: number;
  created_datetime_utc: string | null;
  humor_flavor_id: number;
  llm_temperature: number | null;
  order_by: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_model_id: number;
  humor_flavor_step_type_id: number;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  description: string | null;
  created_by_user_id: string | null;
  modified_by_user_id: string | null;
  modified_datetime_utc: string | null;
};

export type HumorFlavorStepWithFlavor = HumorFlavorStep & {
  humorFlavor: HumorFlavor | null;
};

export type FlavorOption = Pick<HumorFlavor, "id" | "slug">;

export type HumorFlavorInput = {
  slug: string;
  description: string;
};

export type HumorFlavorStepInput = {
  humor_flavor_id: number;
  order_by: number;
  humor_flavor_step_type_id: number;
  llm_model_id: number;
  llm_input_type_id: number;
  llm_output_type_id: number;
  llm_temperature: number;
  llm_system_prompt: string;
  llm_user_prompt: string;
  description: string;
};

export type ActionResult<T> = {
  ok: boolean;
  message: string;
  data?: T;
};

export type CaptionPipelineProgressStep =
  | "presigned_url"
  | "image_upload"
  | "image_register"
  | "captions_generate";

export type CaptionPipelineStepStatus = {
  key: CaptionPipelineProgressStep;
  label: string;
  status: "idle" | "running" | "success" | "error";
  detail?: string;
};

export type PresignedUrlResponse = {
  presignedUrl: string;
  cdnUrl: string;
};

export type RegisterImageResponse = {
  imageId: string;
  now?: string;
};

export type CaptionRecord = {
  id?: string | number;
  caption: string;
  createdAt?: string | null;
  raw?: unknown;
};

export type GenerateCaptionsResponse = {
  raw: unknown;
  captions: CaptionRecord[];
};

export type PipelineRunResult = {
  cdnUrl: string;
  imageId: string;
  generatedAt?: string;
  captions: CaptionRecord[];
  raw: unknown;
};

export type CaptionBrowserRecord = {
  id: string | number;
  humorFlavorId: number;
  caption: string;
  createdAt: string | null;
  imageId?: string | null;
  raw?: unknown;
};

export type CaptionBrowserResult = {
  configured: boolean;
  message: string;
  records: CaptionBrowserRecord[];
};
