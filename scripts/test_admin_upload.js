const fs = require("fs");
const path = require("path");
const { Pool } = require("@neondatabase/serverless");
const { v2: cloudinary } = require("cloudinary");
const { randomUUID } = require("crypto");
const jwt = require("jsonwebtoken");

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, "utf8");
  for (const line of content.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    let val = trimmed.slice(eq + 1);
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

loadDotEnv(path.join(__dirname, "..", ".env.local"));

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("Cloudinary credentials missing in environment");
  process.exit(2);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing in environment");
  process.exit(2);
}
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET missing in environment");
  process.exit(2);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function uploadImage(buffer, category) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: `portfolio/${category}`,
          resource_type: "image",
          context: { category },
          tags: [category, "portfolio-upload"],
          transformation: [
            {
              width: 1200,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        },
      )
      .end(buffer);
  });
}

async function main() {
  try {
    // Generate a short-lived upload token and verify it locally to simulate admin flow
    const token = jwt.sign({ upload: true }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    const verified = (() => {
      try {
        return jwt.verify(token, process.env.JWT_SECRET);
      } catch (e) {
        return null;
      }
    })();
    if (!verified || !verified.upload) {
      console.error("Failed to verify generated token");
      process.exit(3);
    }

    // Create a tiny 1x1 PNG buffer (base64)
    const b64 =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
    const buffer = Buffer.from(b64, "base64");
    const category = "event";

    console.log("Uploading image to Cloudinary...");
    const result = await uploadImage(buffer, category);
    if (!result || !result.secure_url) {
      console.error("Upload failed, no secure_url");
      process.exit(4);
    }

    // Compute next sort_order
    const res = await pool.query(
      "SELECT COALESCE(MAX(sort_order), 0) as max FROM portfolio_items",
    );
    const nextOrder = Number(res.rows[0].max || 0) + 1;

    const id = randomUUID();
    const insertSql = `INSERT INTO public.portfolio_items (id, public_id, cloudinary_url, category, title, caption, sort_order, featured, active, width, height, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now(), now()) RETURNING *`;
    const params = [
      id,
      String(result.public_id),
      String(result.secure_url),
      category,
      "test-upload",
      null,
      nextOrder,
      false,
      true,
      result.width || null,
      result.height || null,
    ];

    const inserted = await pool.query(insertSql, params);
    const row = inserted.rows[0];

    console.log("Inserted row:");
    console.log(
      JSON.stringify(
        {
          id: row.id,
          public_id: row.public_id,
          cloudinary_url: row.cloudinary_url,
          category: row.category,
          title: row.title,
          width: row.width,
          height: row.height,
          sort_order: row.sort_order,
          active: row.active,
          created_at: row.created_at,
        },
        null,
        2,
      ),
    );

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("ERROR", err && err.message ? err.message : err);
    try {
      await pool.end();
    } catch (_) {}
    process.exit(5);
  }
}

main();
