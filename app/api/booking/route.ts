import { pool } from "@/lib/db";
import { appendUploadLog, getClientIp } from "@/lib/logger";
import { verifyUploadToken } from "@/lib/auth-utils";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const uploadSource = request.headers.get("x-upload-source");

  if (!token || !uploadSource || !verifyUploadToken(token)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { id, status, adminNote } = body as any;
    if (!id)
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;
    if (status !== undefined) {
      sets.push(`status = $${idx++}`);
      vals.push(status);
    }
    if (adminNote !== undefined) {
      sets.push(`admin_note = $${idx++}`);
      vals.push(adminNote);
    }
    if (sets.length === 0)
      return new Response(JSON.stringify({ error: "No fields provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    vals.push(id);
    const sql = `UPDATE bookings SET ${sets.join(", ")}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(sql, vals);
    await appendUploadLog({
      type: "upload_success",
      category: "booking",
      ip,
      userAgent,
    });
    return new Response(
      JSON.stringify({ success: true, item: res.rows?.[0] ?? null }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[booking][PATCH] error", err);
    await appendUploadLog({
      type: "upload_error",
      category: "booking",
      error: String(err),
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "Update failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const uploadSource = request.headers.get("x-upload-source");

  if (!token || !uploadSource || !verifyUploadToken(token)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { id } = body as any;
    if (!id)
      return new Response(JSON.stringify({ error: "Missing id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
    await appendUploadLog({
      type: "upload_success",
      category: "booking",
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[booking][DELETE] error", err);
    await appendUploadLog({
      type: "upload_error",
      category: "booking",
      error: String(err),
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "Delete failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
