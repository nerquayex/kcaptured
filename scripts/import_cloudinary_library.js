const fs = require("fs");
const path = require("path");
const { Pool } = require("@neondatabase/serverless");
const { v2: cloudinary } = require("cloudinary");
const { randomUUID } = require("crypto");

// ensure process.env exists
if (typeof process === "undefined") global.process = { env: {} };
else if (!process.env) process.env = {};

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

const FOLDER_DEFAULT = process.env.IMPORT_FOLDER_DEFAULT || "portfolio/event";
const argv = require("minimist")(require("process").argv.slice(2));
const folder = argv.folder || argv.f || FOLDER_DEFAULT;
const doInsert = !!(argv.insert || argv.i);
const limit = argv.limit ? Number(argv.limit) : null;
const pageSize = argv.pageSize ? Number(argv.pageSize) : 500;
const includeStatic = !!(argv.includeStatic || argv.s);
const listAll = !!(argv.all || argv.a);

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("Cloudinary credentials missing in environment");
  if (typeof process.exit === "function") process.exit(2);
  else throw new Error("Cloudinary credentials missing");
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing in environment");
  if (typeof process.exit === "function") process.exit(2);
  else throw new Error("DATABASE_URL missing");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fetchResources(prefix, next_cursor) {
  const opts = {
    resource_type: "image",
    type: "upload",
    max_results: pageSize,
    context: true,
    tags: true,
  };
  // if listAll is true, don't set prefix
  if (prefix && !listAll) opts.prefix = prefix;
  if (next_cursor) opts.next_cursor = next_cursor;
  return cloudinary.api.resources(opts);
}

async function process() {
  console.log(`Import script started (folder=${folder}) dryRun=${!doInsert}`);
  let next_cursor = undefined;
  let scanned = 0;
  let toInsert = [];
  let inserted = 0;
  let skipped = 0;

  try {
    // If includeStatic, parse lib/portfolio-data.ts for static entries
    if (includeStatic) {
      try {
        const staticFile = require("fs").readFileSync(
          require("path").join(__dirname, "..", "lib", "portfolio-data.ts"),
          "utf8",
        );
        const objectRegex = /\{\s*id:\s*'([^']+)'([\s\S]*?)\n\s*\},/g;
        let m;
        while ((m = objectRegex.exec(staticFile)) !== null) {
          const object = m[2];
          const urlMatch = object.match(/cloudinaryUrl:\s*'([^']+)'/);
          if (!urlMatch) continue;
          const url = urlMatch[1];
          // derive public id from URL by stripping version and extension
          const publicId = derivePublicIdFromUrl(url);
          const secure = url;
          const category =
            object.match(/category:\s*'([^']+)'/)?.[1] || "uncategorized";
          const title = object.match(/title:\s*'([^']+)'/)?.[1] || publicId;
          const width = Number(object.match(/width:\s*(\d+)/)?.[1]) || null;
          const height = Number(object.match(/height:\s*(\d+)/)?.[1]) || null;
          toInsert.push({
            public_id: publicId,
            secure_url: secure,
            width,
            height,
            category,
            title,
          });
        }
      } catch (e) {
        console.warn(
          "Could not parse static portfolio-data.ts",
          e && e.message ? e.message : e,
        );
      }
    }

    do {
      const res = await fetchResources(folder, next_cursor);
      const resources = res.resources || [];
      for (const r of resources) {
        scanned++;
        if (limit && scanned > limit) break;
        const public_id = String(r.public_id);
        const secure_url = r.secure_url || r.url || null;
        const width = r.width || null;
        const height = r.height || null;
        // derive category: try context.custom.category else prefix folder segment after base
        let category = undefined;
        try {
          if (r.context && r.context.custom && r.context.custom.category)
            category = r.context.custom.category;
        } catch (e) {}
        if (!category) {
          const parts = public_id.split("/");
          if (parts.length > 1) category = parts[0];
          else category = folder;
        }
        const title = partsTitle(public_id);

        toInsert.push({
          public_id,
          secure_url,
          width,
          height,
          category,
          title,
        });
      }
      next_cursor = res.next_cursor;
      if (limit && scanned >= limit) break;
    } while (next_cursor);

    console.log(`Scanned ${scanned} resources; candidates: ${toInsert.length}`);

    for (const item of toInsert) {
      // normalize public_id
      if (typeof item.public_id === "string")
        item.public_id = item.public_id.replace(/\.[a-zA-Z0-9]+$/, "");
      // skip if no url
      if (!item.secure_url) {
        skipped++;
        continue;
      }
      if (!doInsert) {
        console.log("[DRY] Would insert", item.public_id);
        continue;
      }

      // check exists
      const existing = await pool.query(
        "SELECT id FROM portfolio_items WHERE public_id = $1 LIMIT 1",
        [item.public_id],
      );
      if (existing.rowCount > 0) {
        skipped++;
        continue;
      }

      // ensure required defaults
      if (!item.category) item.category = "uncategorized";
      if (!item.title) item.title = partsTitle(item.public_id);
      const id = randomUUID();
      const insertSql = `INSERT INTO public.portfolio_items (id, public_id, cloudinary_url, category, title, caption, sort_order, featured, active, width, height, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11, now(), now()) RETURNING *`;
      // compute next sort_order as max+1
      const r = await pool.query(
        "SELECT COALESCE(MAX(sort_order), 0) as max FROM portfolio_items",
      );
      const nextOrder = Number(r.rows[0].max || 0) + 1;
      const params = [
        id,
        item.public_id,
        item.secure_url,
        item.category,
        item.title || null,
        null,
        nextOrder,
        false,
        true,
        item.width,
        item.height,
      ];
      const insertedRow = await pool.query(insertSql, params);
      if (insertedRow.rowCount > 0) {
        inserted++;
        console.log("Inserted", item.public_id);
      } else skipped++;
    }

    console.log(
      `Done. scanned=${scanned} inserted=${inserted} skipped=${skipped}`,
    );
    await pool.end();
    if (typeof process.exit === "function") process.exit(0);
    else return;
  } catch (e) {
    console.error("ERROR", e && e.message ? e.message : e);
    try {
      await pool.end();
    } catch (_) {}
    if (typeof process.exit === "function") process.exit(1);
    else return;
  }
}

function partsTitle(public_id) {
  const parts = public_id.split("/");
  return parts.slice(-1)[0];
}

function derivePublicIdFromUrl(url) {
  try {
    let u = String(url);
    const uploadIdx = u.indexOf("/upload/");
    if (uploadIdx !== -1) {
      u = u.slice(uploadIdx + "/upload/".length);
    }
    // remove transformations and version prefix up to v<number>/
    u = u.replace(/^.*?v\d+\//, "");
    // strip query string and extension
    u = u.split("?")[0].replace(/\.[a-zA-Z0-9]+$/, "");
    return u;
  } catch (e) {
    return String(url);
  }
}

process();
