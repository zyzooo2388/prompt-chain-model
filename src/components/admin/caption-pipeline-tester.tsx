"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AdminStatusBanner } from "@/src/components/admin/admin-status-banner";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";
import {
  SUPPORTED_IMAGE_TYPES,
  generateCaptionsForFlavor,
  generatePresignedUrl,
  registerUploadedImage,
  uploadToPresignedUrl,
  validateImageFile,
} from "@/src/lib/caption-pipeline";
import type {
  AdminStatusTone,
  CaptionPipelineStepStatus,
  FlavorOption,
  HumorFlavorStepWithFlavor,
  PipelineRunResult,
} from "@/src/lib/types";

const supabase = createSupabaseBrowserClient();

const defaultSteps: CaptionPipelineStepStatus[] = [
  { key: "presigned_url", label: "Presigned URL created", status: "idle" },
  { key: "image_upload", label: "Image uploaded", status: "idle" },
  { key: "image_register", label: "Image registered", status: "idle" },
  { key: "captions_generate", label: "Captions generated", status: "idle" },
];

export function CaptionPipelineTester({
  flavors,
  steps,
}: {
  flavors: FlavorOption[];
  steps: HumorFlavorStepWithFlavor[];
}) {
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>(flavors[0] ? String(flavors[0].id) : "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState(defaultSteps);
  const [status, setStatus] = useState<{ tone: AdminStatusTone; message: string } | null>(null);
  const [result, setResult] = useState<PipelineRunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedFlavorSteps = useMemo(() => {
    return steps.filter((step) => String(step.humor_flavor_id) === selectedFlavorId);
  }, [selectedFlavorId, steps]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  function updatePipelineStep(
    key: CaptionPipelineStepStatus["key"],
    statusValue: CaptionPipelineStepStatus["status"],
    detail?: string,
  ) {
    setPipelineSteps((current) =>
      current.map((step) =>
        step.key === key ? { ...step, status: statusValue, detail } : step,
      ),
    );
  }

  function resetProgress() {
    setPipelineSteps(defaultSteps);
    setResult(null);
  }

  async function handleRun() {
    if (!file) {
      setStatus({ tone: "error", message: "Choose an image before running the caption test." });
      return;
    }

    if (!selectedFlavorId) {
      setStatus({ tone: "error", message: "Select a humor flavor first." });
      return;
    }

    try {
      validateImageFile(file);
      resetProgress();
      setIsRunning(true);
      setStatus({ tone: "loading", message: "Running caption pipeline..." });

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Could not read the logged-in Supabase access token.");
      }

      updatePipelineStep("presigned_url", "running", "Requesting upload URL...");
      const accessToken = session.access_token;
      const presigned = await generatePresignedUrl(accessToken, file.type);
      updatePipelineStep("presigned_url", "success", presigned.cdnUrl);

      updatePipelineStep("image_upload", "running", "Uploading bytes to the presigned URL...");
      await uploadToPresignedUrl(presigned.presignedUrl, file);
      updatePipelineStep("image_upload", "success");

      updatePipelineStep("image_register", "running", "Registering the image URL with the pipeline...");
      const registration = await registerUploadedImage(accessToken, presigned.cdnUrl);
      updatePipelineStep("image_register", "success", registration.imageId);

      updatePipelineStep("captions_generate", "running", "Generating captions...");
      const generated = await generateCaptionsForFlavor(
        accessToken,
        registration.imageId,
        Number(selectedFlavorId),
      );
      const pipelineResult: PipelineRunResult = {
        cdnUrl: presigned.cdnUrl,
        imageId: registration.imageId,
        generatedAt: registration.now,
        captions: generated.captions,
        raw: generated.raw,
      };

      updatePipelineStep(
        "captions_generate",
        "success",
        pipelineResult.captions.length
          ? `${pipelineResult.captions.length} caption(s) returned.`
          : "The API returned successfully but no captions were recognized in the response shape.",
      );
      setResult(pipelineResult);
      setStatus({ tone: "success", message: "Caption pipeline completed." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Caption pipeline failed.";
      setStatus({ tone: "error", message });
      setPipelineSteps((current) => {
        const runningStep = current.find((step) => step.status === "running");
        if (!runningStep) {
          return current;
        }

        return current.map((step) =>
          step.key === runningStep.key ? { ...step, status: "error", detail: message } : step,
        );
      });
    } finally {
      setIsRunning(false);
    }
  }

  async function handleCopy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setStatus({ tone: "success", message: `${label} copied.` });
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6 rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--admin-foreground)]">Run caption test</h2>
            <p className="mt-2 text-sm text-[var(--admin-muted)]">
              Valid file types: {SUPPORTED_IMAGE_TYPES.join(", ")}.
            </p>
          </div>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-foreground)]">Humor flavor</span>
            <select
              value={selectedFlavorId}
              onChange={(event) => setSelectedFlavorId(event.target.value)}
              className="w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--admin-accent)]"
            >
              {flavors.map((flavor) => (
                <option key={flavor.id} value={flavor.id}>
                  {flavor.slug} (#{flavor.id})
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[var(--admin-foreground)]">Image file</span>
            <input
              type="file"
              accept={SUPPORTED_IMAGE_TYPES.join(",")}
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                setStatus(null);
              }}
              className="block w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-4 py-3 text-sm text-[var(--admin-muted)]"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning || !file || !selectedFlavorId}
              className="rounded-full bg-[var(--admin-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRunning ? "Running..." : "Run Caption Test"}
            </button>
            <button
              type="button"
              onClick={resetProgress}
              className="rounded-full border border-[var(--admin-border)] px-5 py-3 text-sm font-semibold text-[var(--admin-muted)] transition hover:bg-[var(--admin-surface-strong)]"
            >
              Reset results
            </button>
          </div>

          {previewUrl ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-[var(--admin-surface-strong)]">
              <div className="relative aspect-[4/3]">
                <Image src={previewUrl} alt="Uploaded preview" fill className="object-contain" unoptimized />
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-10 text-sm text-[var(--admin-muted)]">
              Upload an image to preview it here.
            </div>
          )}
        </div>

        <div className="space-y-6 rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--admin-foreground)]">Ordered steps</h2>
            <p className="mt-2 text-sm text-[var(--admin-muted)]">
              The selected flavor runs these steps in `order_by` order.
            </p>
          </div>

          {selectedFlavorSteps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-8 text-sm text-[var(--admin-muted)]">
              No steps found for this humor flavor.
            </div>
          ) : (
            <div className="space-y-4">
              {selectedFlavorSteps.map((step) => (
                <div
                  key={step.id}
                  className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--admin-foreground)]">
                        Step {step.order_by}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--admin-muted)]">
                        Step id {step.id}
                      </p>
                    </div>
                    <div className="rounded-full bg-[var(--admin-surface)] px-3 py-1 text-xs font-medium text-[var(--admin-muted)]">
                      model {step.llm_model_id}
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--admin-muted)]">
                    {step.description || "No description"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {status ? <AdminStatusBanner tone={status.tone} message={status.message} /> : null}

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--admin-foreground)]">Pipeline status</h2>
          <div className="mt-4 space-y-3">
            {pipelineSteps.map((step) => (
              <div
                key={step.key}
                className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-[var(--admin-foreground)]">{step.label}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${
                      step.status === "success"
                        ? "bg-emerald-500/15 text-emerald-700"
                        : step.status === "error"
                          ? "bg-rose-500/15 text-rose-700"
                          : step.status === "running"
                            ? "bg-sky-500/15 text-sky-700"
                            : "bg-[var(--admin-surface)] text-[var(--admin-muted)]"
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
                {step.detail ? <p className="mt-2 text-sm text-[var(--admin-muted)]">{step.detail}</p> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[var(--admin-foreground)]">Returned captions</h2>
          {!result ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-10 text-sm text-[var(--admin-muted)]">
              Run a caption test to inspect `imageId`, `cdnUrl`, and the generated caption payload.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <CopyCard label="imageId" value={result.imageId} onCopy={handleCopy} />
                <CopyCard label="cdnUrl" value={result.cdnUrl} onCopy={handleCopy} />
              </div>

              {result.captions.length === 0 ? (
                <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] px-5 py-6 text-sm text-[var(--admin-muted)]">
                  The API call succeeded, but no captions matched the current normalization rules. The raw response is shown below.
                </div>
              ) : (
                <div className="grid gap-4">
                  {result.captions.map((caption, index) => (
                    <div
                      key={caption.id ?? index}
                      className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">
                          Caption {index + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleCopy(caption.caption, `Caption ${index + 1}`)}
                          className="rounded-full border border-[var(--admin-border)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-foreground)] transition hover:bg-[var(--admin-surface)]"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="mt-3 text-base leading-7 text-[var(--admin-foreground)]">{caption.caption}</p>
                    </div>
                  ))}
                </div>
              )}

              <details className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--admin-foreground)]">
                  Raw API response
                </summary>
                <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[var(--admin-muted)]">
                  {JSON.stringify(result.raw, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CopyCard({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string;
  onCopy: (value: string, label: string) => Promise<void>;
}) {
  return (
    <div className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface-strong)] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-muted)]">{label}</p>
      <p className="mt-2 break-all text-sm text-[var(--admin-foreground)]">{value}</p>
      <button
        type="button"
        onClick={() => onCopy(value, label)}
        className="mt-3 rounded-full border border-[var(--admin-border)] px-3 py-1.5 text-xs font-semibold text-[var(--admin-foreground)] transition hover:bg-[var(--admin-surface)]"
      >
        Copy
      </button>
    </div>
  );
}
