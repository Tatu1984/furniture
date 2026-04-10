import { NextResponse, type NextRequest } from "next/server";
import { put } from "@vercel/blob";

// ---------------------------------------------------------------------------
// POST /api/upload — Upload one or more files to Vercel Blob
//
// Accepts multipart/form-data with field(s) named "file".
// Returns { urls: string[] } with the public URLs of the uploaded blobs.
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
  "image/svg+xml",
]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB per file

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 },
      );
    }

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}` },
          { status: 400 },
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          {
            error: `File "${file.name}" exceeds 10 MB limit`,
          },
          { status: 400 },
        );
      }

      const blob = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
      });
      urls.push(blob.url);
    }

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
