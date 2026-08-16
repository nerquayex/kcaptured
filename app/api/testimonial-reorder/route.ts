import { verifyUploadToken } from "@/lib/auth-utils";
import { appendUploadLog, getClientIp } from "@/lib/logger";
import { pool } from "@/lib/db";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const uploadSource = request.headers.get("x-upload-source");

  if (!token || uploadSource !== "kc-upload" || !verifyUploadToken(token)) {
    await appendUploadLog({
      type: "upload_error",
      error: "Unauthorized testimonial reorder",
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
    const { id, toIndex } = body as any;
    if (typeof id === "undefined" || typeof toIndex === "undefined") {
      return new Response(JSON.stringify({ error: "Missing id or toIndex" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch current ordered list
    const cur = await pool.query(
      "SELECT id FROM testimonials ORDER BY sort_order ASC",
    );
    const ids = (cur.rows ?? []).map((r: any) => r.id);
    const fromIndex = ids.indexOf(id);
    if (fromIndex === -1)
      return new Response(JSON.stringify({ error: "ID not found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });

    // Remove and insert
    ids.splice(fromIndex, 1);
    const insertIndex = Math.max(0, Math.min(toIndex, ids.length));
    ids.splice(insertIndex, 0, id);

    // Update sort_order in transaction
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (let i = 0; i < ids.length; i++) {
        await client.query(
          "UPDATE testimonials SET sort_order = $1 WHERE id = $2",
          [i, ids[i]],
        );
      }
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    await appendUploadLog({ type: "reorder", ip, userAgent });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[testimonial-reorder] error", err);
    return new Response(JSON.stringify({ error: "Reorder failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
