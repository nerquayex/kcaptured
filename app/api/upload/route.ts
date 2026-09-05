import { v2 as cloudinary } from "cloudinary";
import { appendUploadLog, getClientIp } from "@/lib/logger";
import { verifyUploadToken } from "@/lib/auth-utils";
import db, { pool } from "@/lib/db";
import { portfolioItems } from "@/db/schema";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

function getAllowedCategories() {
  return (process.env.NEXT_PUBLIC_UPLOAD_CATEGORIES ?? "studio,lifestyle,event")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => /^[a-zA-Z0-9_-]+$/.test(item));
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const uploadSource = request.headers.get("x-upload-source");

  if (!token || uploadSource !== "kc-upload" || !verifyUploadToken(token)) {
    await appendUploadLog({
      type: "upload_error",
      error: "Unauthorized upload request",
      uploadSource: uploadSource ?? "missing",
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const formData = await request.formData();
  const fileEntry = formData.get("file");
  const category = String(formData.get("category") ?? "uncategorized");
  const title = String(formData.get("title") ?? "");
  const caption = formData.get("caption")
    ? String(formData.get("caption"))
    : null;
  const featured = formData.get("featured") === "true";
  const allowedCategories = getAllowedCategories();

  if (category === "client-uploads") {
    await appendUploadLog({
      type: "upload_error",
      error: "Client Uploads category is no longer supported",
      category,
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "Use the Events category" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  await appendUploadLog({
    type: "upload_attempt",
    category,
    fileName: fileEntry instanceof File ? fileEntry.name : undefined,
    fileSize: fileEntry instanceof File ? fileEntry.size : undefined,
    fileMimeType: fileEntry instanceof File ? fileEntry.type : undefined,
    ip,
    userAgent,
  });

  if (!(fileEntry instanceof File)) {
    await appendUploadLog({
      type: "upload_error",
      error: "No file was provided",
      category,
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!ALLOWED_MIME_TYPES.includes(fileEntry.type)) {
    await appendUploadLog({
      type: "upload_error",
      error: `Invalid file type: ${fileEntry.type}`,
      fileName: fileEntry.name,
      fileSize: fileEntry.size,
      fileMimeType: fileEntry.type,
      category,
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "Invalid file type" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (fileEntry.size > MAX_FILE_SIZE) {
    await appendUploadLog({
      type: "upload_error",
      error: `File too large: ${fileEntry.size} bytes`,
      fileName: fileEntry.name,
      fileSize: fileEntry.size,
      fileMimeType: fileEntry.type,
      category,
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "File too large" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const normalizedCategory = allowedCategories.includes(category)
    ? category
    : "uncategorized";

  let uploadResult: any;
  try {
    uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `portfolio/${normalizedCategory}`,
          resource_type: "image",
          context: { category: normalizedCategory },
          tags: [normalizedCategory, "portfolio-upload"],
          transformation: [
            {
              width: 1200,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      fileEntry.arrayBuffer().then((buffer) => {
        uploadStream.end(Buffer.from(buffer));
      }, reject);
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
          ? String(error.message)
          : JSON.stringify(error);
    await appendUploadLog({
      type: "upload_error",
      error: `Cloudinary upload failed: ${message}`,
      fileName: fileEntry.name,
      fileSize: fileEntry.size,
      fileMimeType: fileEntry.type,
      category: normalizedCategory,
      ip,
      userAgent,
    });
    return new Response(
      JSON.stringify({ error: "Image storage upload failed" }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (!uploadResult?.secure_url) {
    await appendUploadLog({
      type: "upload_error",
      error: "Cloudinary did not return a secure URL",
      fileName: fileEntry.name,
      fileSize: fileEntry.size,
      fileMimeType: fileEntry.type,
      category: normalizedCategory,
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  await appendUploadLog({
    type: "upload_success",
    fileName: fileEntry.name,
    fileSize: fileEntry.size,
    fileMimeType: fileEntry.type,
    category: normalizedCategory,
    publicId: uploadResult.public_id,
    url: uploadResult.secure_url,
    ip,
    userAgent,
  });

  // Determine next sort_order
  let nextOrder = 1;
  try {
    const res = await pool.query(
      "SELECT COALESCE(MAX(sort_order), 0) as max FROM portfolio_items",
    );
    const max = res?.rows?.[0]?.max ?? 0;
    nextOrder = Number(max) + 1;
  } catch (e) {
    console.warn("[upload] failed to compute next sort_order", e);
  }

  // Persist portfolio item
  const id = randomUUID();
  let inserted: any;
  try {
    inserted = await db
      .insert(portfolioItems)
      .values({
        id,
        public_id: String(uploadResult.public_id),
        cloudinary_url: String(uploadResult.secure_url),
        category: normalizedCategory,
        title: title || (fileEntry.name ?? String(uploadResult.public_id)),
        caption: caption,
        sort_order: nextOrder,
        featured: featured,
        active: true,
        width: Number(uploadResult.width) || null,
        height: Number(uploadResult.height) || null,
      })
      .returning();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database insert failed";
    await appendUploadLog({
      type: "upload_error",
      error: `Database insert failed: ${message}`,
      fileName: fileEntry.name,
      fileSize: fileEntry.size,
      fileMimeType: fileEntry.type,
      category: normalizedCategory,
      publicId: String(uploadResult.public_id),
      url: String(uploadResult.secure_url),
      ip,
      userAgent,
    });
    return new Response(
      JSON.stringify({
        error: "Image uploaded but could not be saved to the portfolio",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const persisted = Array.isArray(inserted) ? inserted[0] : inserted;

  const mapped = {
    id: persisted.id,
    publicId: persisted.public_id,
    cloudinaryUrl: persisted.cloudinary_url,
    category: persisted.category,
    title: persisted.title,
    caption: persisted.caption,
    width: persisted.width,
    height: persisted.height,
    featured: persisted.featured,
    active: persisted.active,
    sort_order: persisted.sort_order,
    created_at: persisted.created_at,
  };

  return new Response(
    JSON.stringify({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      item: mapped,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
