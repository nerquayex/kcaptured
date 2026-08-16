import { getTestimonials as getStaticTestimonials } from "@/lib/testimonials-data";
import { getUploadedTestimonials } from "@/lib/cloudinary-uploads";
import { pool } from "@/lib/db";
import { verifyUploadToken } from "@/lib/auth-utils";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const admin =
      url.searchParams.get("admin") === "1" ||
      url.searchParams.get("admin") === "true";

    // If admin requested, require upload token
    if (admin) {
      const authHeader = request.headers.get("authorization") ?? "";
      const token = authHeader.replace(/^Bearer\s+/i, "");
      if (!token || !verifyUploadToken(token)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Prefer DB-backed testimonials if available
    try {
      const q = admin
        ? "SELECT id, client_name, client_role, content, video_url, video_public_id, image_url, active, featured, sort_order FROM testimonials ORDER BY sort_order ASC"
        : "SELECT id, client_name, client_role, content, video_url, video_public_id, image_url, active, featured, sort_order FROM testimonials WHERE active = true ORDER BY sort_order ASC";

      const res = await pool.query(q);
      const rows = (res?.rows ?? []).map((r: any) => ({
        id: r.id,
        clientName: r.client_name,
        clientRole: r.client_role,
        content: r.content,
        videoUrl: r.video_url || null,
        videoPublicId: r.video_public_id || null,
        imageUrl: r.image_url || null,
        featured: r.featured,
        sortOrder: r.sort_order,
        active: r.active,
      }));

      if (rows.length > 0) {
        return new Response(JSON.stringify(rows), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (e) {
      // If DB is not available or table missing, fallback to cloudinary/static
      console.warn(
        "[testimonials][GET] DB query failed, falling back to cloudinary/static",
        e,
      );
    }

    const staticTestimonials = getStaticTestimonials();
    const uploadedTestimonials = await getUploadedTestimonials();
    // Combine uploaded testimonials first (most recent), then static ones
    const allTestimonials = [...uploadedTestimonials, ...staticTestimonials];
    return new Response(JSON.stringify(allTestimonials), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to get testimonials:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load testimonials" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
