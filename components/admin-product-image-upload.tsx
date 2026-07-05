"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

type UploadState = "idle" | "uploading" | "done" | "error";

function fileToImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read this image."));
    };
    image.src = url;
  });
}

async function resizeImage(file: File) {
  const image = await fileToImage(file);
  const maxSize = 1600;
  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not prepare this image.");
  context.drawImage(image, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not compress this image."));
    }, "image/jpeg", 0.82);
  });
}

function addUrlToField(form: HTMLFormElement, fieldName: string, url: string, mode: "append" | "replace") {
  const field = form.elements.namedItem(fieldName);

  if (field instanceof HTMLInputElement) {
    field.value = url;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }

  if (!(field instanceof HTMLTextAreaElement)) return false;

  if (mode === "replace") {
    field.value = url;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  }

  const currentUrls = field.value
    .split("\n")
    .map((value) => value.trim())
    .filter(Boolean);

  field.value = [...currentUrls, url].join("\n");
  field.dispatchEvent(new Event("input", { bubbles: true }));
  return true;
}

export function AdminProductImageUpload({
  fieldName = "image_urls",
  mode = "append",
  title = "Product photos",
  buttonLabel = "Upload photos",
  helpText = "Upload real photos from this device. They will be added to Image URLs automatically.",
  multiple = true
}: {
  fieldName?: string;
  mode?: "append" | "replace";
  title?: string;
  buttonLabel?: string;
  helpText?: string;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [message, setMessage] = useState(helpText);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;

    const form = inputRef.current?.closest("form");
    if (!(form instanceof HTMLFormElement)) {
      setState("error");
      setMessage("Could not find the product form. Refresh and try again.");
      return;
    }

    setState("uploading");
    const selectedFiles = multiple ? Array.from(files) : Array.from(files).slice(0, 1);
    setMessage(`Uploading ${selectedFiles.length} photo${selectedFiles.length === 1 ? "" : "s"}...`);

    try {
      let uploaded = 0;

      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files can be uploaded.");
        }

        const resized = await resizeImage(file);
        const uploadData = new FormData();
        uploadData.append("file", resized, `${file.name.replace(/\.[^.]+$/, "") || "product-photo"}.jpg`);

        const response = await fetch("/admin/uploads/product-image", {
          method: "POST",
          body: uploadData
        });
        const result = await response.json() as { url?: string; error?: string };

        if (!response.ok || !result.url) {
          throw new Error(result.error ?? "Image upload failed.");
        }

        if (!addUrlToField(form, fieldName, result.url, mode)) {
          throw new Error("Could not add the image URL to the form.");
        }

        uploaded += 1;
      }

      setState("done");
      setMessage(`${uploaded} photo${uploaded === 1 ? "" : "s"} uploaded. Click Save to keep the change.`);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-lg border border-line bg-white p-3">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple={multiple}
        onChange={(event) => uploadFiles(event.target.files)}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className={`mt-1 text-xs leading-5 ${state === "error" ? "text-danger" : "text-neutral-600"}`}>{message}</p>
        </div>
        <button
          className="admin-clickable inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line bg-snow px-4 py-2 text-sm font-medium text-ink transition hover:border-gold hover:text-red disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={state === "uploading"}
        >
          {state === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
