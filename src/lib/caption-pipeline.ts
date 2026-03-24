import type {
  CaptionRecord,
  GenerateCaptionsResponse,
  PipelineRunResult,
  PresignedUrlResponse,
  RegisterImageResponse,
} from "@/src/lib/types";

export const PIPELINE_API_BASE_URL = "https://api.almostcrackd.ai";
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
] as const;

async function parseJsonSafe(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function assertOk(response: Response, fallbackMessage: string) {
  if (response.ok) {
    return;
  }

  const payload = await parseJsonSafe(response);
  const detail =
    typeof payload === "string"
      ? payload
      : payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : JSON.stringify(payload);

  throw new Error(`${fallbackMessage} (${response.status}): ${detail}`);
}

function normalizeCaptionList(raw: unknown): CaptionRecord[] {
  if (Array.isArray(raw)) {
    return raw.flatMap((item, index) => {
      if (typeof item === "string") {
        return [{ id: index, caption: item, raw: item }];
      }

      if (item && typeof item === "object") {
        const captionValue =
          "caption" in item
            ? item.caption
            : "text" in item
              ? item.text
              : "content" in item
                ? item.content
                : null;

        if (typeof captionValue === "string") {
          return [
            {
              id:
                "id" in item && (typeof item.id === "string" || typeof item.id === "number")
                  ? item.id
                  : index,
              caption: captionValue,
              createdAt:
                "created_datetime_utc" in item && typeof item.created_datetime_utc === "string"
                  ? item.created_datetime_utc
                  : null,
              raw: item,
            },
          ];
        }
      }

      return [];
    });
  }

  if (raw && typeof raw === "object") {
    if ("captions" in raw) {
      return normalizeCaptionList(raw.captions);
    }

    if ("data" in raw) {
      return normalizeCaptionList(raw.data);
    }
  }

  return [];
}

export function validateImageFile(file: File) {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as (typeof SUPPORTED_IMAGE_TYPES)[number])) {
    throw new Error(
      `Unsupported file type "${file.type}". Use JPEG, JPG, PNG, WEBP, GIF, or HEIC.`,
    );
  }
}

export async function generatePresignedUrl(accessToken: string, contentType: string) {
  const response = await fetch(`${PIPELINE_API_BASE_URL}/pipeline/generate-presigned-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contentType }),
  });

  await assertOk(response, "Could not create a presigned upload URL");
  return (await response.json()) as PresignedUrlResponse;
}

export async function uploadToPresignedUrl(presignedUrl: string, file: File) {
  const response = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: await file.arrayBuffer(),
  });

  await assertOk(response, "Could not upload the image bytes");
}

export async function registerUploadedImage(accessToken: string, imageUrl: string) {
  const response = await fetch(`${PIPELINE_API_BASE_URL}/pipeline/upload-image-from-url`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUrl,
      isCommonUse: false,
    }),
  });

  await assertOk(response, "Could not register the uploaded image");
  return (await response.json()) as RegisterImageResponse;
}

export async function generateCaptionsForFlavor(accessToken: string, imageId: string, flavorId: number) {
  const response = await fetch(`${PIPELINE_API_BASE_URL}/pipeline/generate-captions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageId,
      humorFlavorId: flavorId,
    }),
  });

  await assertOk(response, "Could not generate captions");
  const raw = (await response.json()) as unknown;
  return {
    raw,
    captions: normalizeCaptionList(raw),
  } satisfies GenerateCaptionsResponse;
}

export async function runCaptionPipeline(
  accessToken: string,
  file: File,
  flavorId: number,
): Promise<PipelineRunResult> {
  validateImageFile(file);
  const presigned = await generatePresignedUrl(accessToken, file.type);
  await uploadToPresignedUrl(presigned.presignedUrl, file);
  const registration = await registerUploadedImage(accessToken, presigned.cdnUrl);
  const generated = await generateCaptionsForFlavor(accessToken, registration.imageId, flavorId);

  return {
    cdnUrl: presigned.cdnUrl,
    imageId: registration.imageId,
    generatedAt: registration.now,
    captions: generated.captions,
    raw: generated.raw,
  };
}
