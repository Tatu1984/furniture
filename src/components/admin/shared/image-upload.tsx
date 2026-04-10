"use client";

import * as React from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadedImage {
  url: string;
  alt?: string;
}

interface ImageUploadProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  /** Maximum number of images allowed. Default: 10 */
  max?: number;
  /** Label shown above the upload area */
  label?: string;
  /** Allow only a single image (convenience for max=1) */
  single?: boolean;
  className?: string;
}

export function ImageUpload({
  value = [],
  onChange,
  max = 10,
  label,
  single,
  className,
}: ImageUploadProps) {
  const effectiveMax = single ? 1 : max;
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const remaining = effectiveMax - value.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${effectiveMax} image(s) allowed`);
      return;
    }

    const files = Array.from(fileList).slice(0, remaining);
    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("file", f));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || "Upload failed");
      }

      const newImages: UploadedImage[] = (data.urls as string[]).map(
        (url) => ({
          url,
          alt: "",
        }),
      );

      if (single) {
        onChange(newImages.slice(0, 1));
      } else {
        onChange([...value, ...newImages]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset the input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  const canAddMore = value.length < effectiveMax;

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <p className="text-sm font-medium leading-none">{label}</p>
      )}

      {/* Thumbnails */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((img, i) => (
            <div
              key={`${img.url}-${i}`}
              className="relative group w-24 h-24 rounded-lg overflow-hidden border bg-muted"
            >
              <Image
                src={img.url}
                alt={img.alt || ""}
                fill
                className="object-cover"
                sizes="96px"
                unoptimized
              />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {canAddMore && (
        <div
          role="button"
          tabIndex={0}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/50",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Uploading…
              </span>
            </>
          ) : (
            <>
              <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                {value.length === 0 ? (
                  <ImageIcon className="size-5 text-muted-foreground" />
                ) : (
                  <Upload className="size-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {value.length === 0
                    ? "Click or drag to upload"
                    : "Add more images"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPEG, PNG, WebP, GIF — max 10 MB each
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
        multiple={!single}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
