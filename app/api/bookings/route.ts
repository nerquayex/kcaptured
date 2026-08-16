import { pool } from "@/lib/db";
import { appendUploadLog, getClientIp } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown";

  try {
    const body = await request.json();
    const { clientName, email, phone, sessionType, requestedAt, message } =
      body as any;

    if (!clientName || !email || !requestedAt) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const id = `booking-${Date.now()}`;
    await pool.query(
      `INSERT INTO bookings (id, client_name, email, phone, session_type, requested_at, message, status, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending', now(), now())`,
      [
        id,
        clientName,
        email,
        phone ?? null,
        sessionType ?? null,
        requestedAt,
        message ?? null,
      ],
    );

    await appendUploadLog({
      type: "upload_success",
      category: "booking",
      ip,
      userAgent,
    });

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[bookings][POST] error", err);
    await appendUploadLog({
      type: "upload_error",
      category: "booking",
      error: String(err),
      ip,
      userAgent,
    });
    return new Response(JSON.stringify({ error: "Failed to create booking" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(request: Request) {
  // Admin-only listing when ?admin=1
  const url = new URL(request.url);
  const admin =
    url.searchParams.get("admin") === "1" ||
    url.searchParams.get("admin") === "true";
  if (!admin) {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Authorization is handled by verifyUploadToken in callers (client provides token in Authorization header) — check here
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { verifyUploadToken } = await import("@/lib/auth-utils");
  if (!token || !verifyUploadToken(token)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await pool.query(
      "SELECT id, client_name, email, phone, session_type, requested_at, message, status, admin_note, created_at, updated_at FROM bookings ORDER BY created_at DESC",
    );
    return new Response(JSON.stringify(res.rows ?? []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[bookings][GET] error", err);
    return new Response(JSON.stringify({ error: "Failed to list bookings" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
