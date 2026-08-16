import { pool } from "@/lib/db";
import { appendUploadLog, getClientIp } from "@/lib/logger";
import { verifyUploadToken } from "@/lib/auth-utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await pool.query(
      "SELECT id, business_name, email, instagram_url, tiktok_url, cash_app, zelle_email, updated_at FROM site_settings WHERE id = $1",
      ["default"],
    );
    const row = res.rows?.[0];
    return new Response(JSON.stringify(row ?? {}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[settings][GET] error", err);
    return new Response(JSON.stringify({ error: "Failed to load settings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PATCH(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const uploadSource = request.headers.get("x-upload-source");

  if (!token || uploadSource !== "kc-upload" || !verifyUploadToken(token)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const {
      businessName,
      email,
      instagramUrl,
      tiktokUrl,
      cashApp,
      zelleEmail,
    } = body as any;

    const sets: string[] = [];
    const vals: any[] = [];
    let idx = 1;

    if (businessName !== undefined) {
      sets.push(`business_name = $${idx++}`);
      vals.push(businessName);
    }
    if (email !== undefined) {
      sets.push(`email = $${idx++}`);
      vals.push(email);
    }
    if (instagramUrl !== undefined) {
      sets.push(`instagram_url = $${idx++}`);
      vals.push(instagramUrl);
    }
    if (tiktokUrl !== undefined) {
      sets.push(`tiktok_url = $${idx++}`);
      vals.push(tiktokUrl);
    }
    if (cashApp !== undefined) {
      sets.push(`cash_app = $${idx++}`);
      vals.push(cashApp);
    }
    if (zelleEmail !== undefined) {
      sets.push(`zelle_email = $${idx++}`);
      vals.push(zelleEmail);
    }

    if (sets.length === 0) {
      return new Response(JSON.stringify({ error: "No fields provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    vals.push("default");
    const sql = `UPDATE site_settings SET ${sets.join(", ")}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const res = await pool.query(sql, vals);

    await appendUploadLog({
      type: "upload_success",
      category: "settings",
      ip,
      userAgent,
    });
    return new Response(
      JSON.stringify({ success: true, item: res.rows?.[0] ?? null }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("[settings][PATCH] error", err);
    await appendUploadLog({
      type: "upload_error",
      category: "settings",
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
