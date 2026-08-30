// Runs `prisma db push` before the build, but only when explicitly opted in
// via AUTO_DB_PUSH=1 (set that in Vercel's project env vars, not locally).
// This lets a serverless deployment self-provision its schema against a
// fresh database on each build without making that a requirement for
// ordinary local development, where nobody wants `npm run build` to reach
// out to a database at all.
import { execSync } from "node:child_process";

if (process.env.AUTO_DB_PUSH === "1") {
  console.log("[maybe-db-push] AUTO_DB_PUSH=1 — syncing schema to DATABASE_URL before build…");
  execSync("npx prisma db push --accept-data-loss --skip-generate", { stdio: "inherit" });
} else {
  console.log("[maybe-db-push] AUTO_DB_PUSH not set — skipping (this is expected for local dev builds).");
}
