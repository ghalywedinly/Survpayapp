// Runs before `next build`, in two parts:
//
// 1. Always regenerates the Prisma client explicitly. This is a safety net
//    on top of the `postinstall` hook: some build environments (Vercel's
//    npm included, as of this writing) gate dependency install scripts
//    behind an approval step ("npm warn allow-scripts ... not yet covered
//    by allowScripts"), which can leave `prisma`/`@prisma/client`'s own
//    setup incomplete even though our root-level `postinstall` script did
//    run. `prisma generate` is idempotent and fetches whatever engine
//    binaries it needs on its own, so re-running it here is cheap and
//    makes the build resilient to that regardless of the exact cause.
//
// 2. Runs `prisma db push` against DATABASE_URL, but only when explicitly
//    opted in via AUTO_DB_PUSH=1 (set that in Vercel's project env vars,
//    not locally). This lets a serverless deployment self-provision its
//    schema on a fresh database without making that a requirement for
//    ordinary local development, where nobody wants `npm run build`
//    reaching out to a database at all.
import { execSync } from "node:child_process";

console.log("[prebuild] Generating Prisma client…");
execSync("npx prisma generate", { stdio: "inherit" });

if (process.env.AUTO_DB_PUSH === "1") {
  console.log("[prebuild] AUTO_DB_PUSH=1 — syncing schema to DATABASE_URL…");
  execSync("npx prisma db push --accept-data-loss --skip-generate", { stdio: "inherit" });
} else {
  console.log("[prebuild] AUTO_DB_PUSH not set — skipping schema push (expected for local dev builds).");
}
