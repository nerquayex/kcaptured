const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Load .env.local manually
function loadDotEnv(file) {
    if (!fs.existsSync(file)) {
        console.error("ERROR: .env.local not found");
        return;
    }
    const content = fs.readFileSync(file, "utf8");
    for (const line of content.split(/\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        // Remove surrounding quotes if present
        if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
        ) {
            val = val.slice(1, -1);
        }
        process.env[key] = val;
    }
}

loadDotEnv(path.join(__dirname, ".env.local"));

console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✓ set" : "✗ not set");

if (!process.env.DATABASE_URL) {
    console.error("ERROR: DATABASE_URL not set");
    process.exit(1);
}

console.log("Running drizzle-kit migrate...");
try {
    execSync("pnpm run db:migrate", {
        stdio: "inherit",
        env: process.env,
    });
    console.log("✓ Migration completed successfully");
    process.exit(0);
} catch (err) {
    console.error("✗ Migration failed:", err.message);
    process.exit(1);
}
