import { verifyUploadToken } from "@/lib/auth-utils";
import { appendUploadLog, getClientIp } from "@/lib/logger";
import { pool } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const uploadSource = request.headers.get("x-upload-source");

  if (!token || uploadSource !== "kc-upload" || !verifyUploadToken(token)) {
    await appendUploadLog({
      type: "upload_error",
      error: "Unauthorized testimonial update",
      uploadSource: uploadSource ?? "missing",
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const {
      id,
      clientName,
      clientRole,
      content,
      imageUrl,
      active,
      featured,
      newVideoPublicId,
      newVideoUrl,
    } = body as any;
    if (!id)
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    // If replacing video, delete old asset
    if (newVideoPublicId) {
      try {
        const old = await pool.query(
          "SELECT video_public_id FROM testimonials WHERE id = $1",
          [id],
        );
        const oldId = old?.rows?.[0]?.video_public_id;
        if (oldId && process.env.CLOUDINARY_API_KEY) {
          await cloudinary.uploader.destroy(oldId, { resource_type: "video" });
        }
      } catch (e) {
        console.warn(
          "[testimonial][PATCH] failed to delete old cloudinary asset",
          e,
        );
      }
    }

    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    if (clientName !== undefined) {
      sets.push(`client_name = $${idx++}`);
      vals.push(clientName);
    }
    if (clientRole !== undefined) {
      sets.push(`client_role = $${idx++}`);
      vals.push(clientRole);
    }
    if (content !== undefined) {
      sets.push(`content = $${idx++}`);
      vals.push(content);
    }
    if (imageUrl !== undefined) {
      sets.push(`image_url = $${idx++}`);
      vals.push(imageUrl);
    }
    if (active !== undefined) {
      sets.push(`active = $${idx++}`);
      vals.push(Boolean(active));
    }
    if (featured !== undefined) {
      sets.push(`featured = $${idx++}`);
      vals.push(Boolean(featured));
    }
    if (newVideoPublicId !== undefined) {
      sets.push(`video_public_id = $${idx++}`);
      vals.push(newVideoPublicId);
    }
    if (newVideoUrl !== undefined) {
      sets.push(`video_url = $${idx++}`);
      vals.push(newVideoUrl);
    }

    if (sets.length === 0)
      return new Response(JSON.stringify({ error: "No fields provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    vals.push(id);
    const sql = `UPDATE testimonials SET ${sets.join(", ")}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(sql, vals);
    const row = res?.rows?.[0];

    await appendUploadLog({ type: "upload_success", ip, userAgent });

    return new Response(JSON.stringify({ success: true, item: row }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[testimonial][PATCH] error", err);
    return new Response(JSON.stringify({ error: "Update failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
