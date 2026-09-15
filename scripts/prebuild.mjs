// Runs before `next build`. Only ever regenerates the Prisma client.
//
// This used to also optionally run `prisma db push` against DATABASE_URL
// (gated behind AUTO_DB_PUSH=1) so a serverless deployment could
// self-provision its schema. In practice that hung indefinitely on
// Supabase: `prisma db push` needs a direct (non-pooled) connection for the
// advisory locks it takes during a schema change, but from Vercel's build
// network it kept connecting through the pooled transaction-mode URL
// instead — which can't coordinate those locks — so the build would just
// hang until Vercel killed it, surfacing as an unrelated-looking
// "Collecting page data" failure. Schema changes are applied once, up
// front, by running the generated SQL (see `prisma migrate diff
// --from-empty --to-schema-datamodel prisma/schema.prisma --script`)
// directly in Supabase's SQL editor — see README's "Database" section —
// which runs inside Supabase's own network and never touches the build.
//
// Regenerating the client here is still a safety net on top of the
// `postinstall` hook: some build environments (Vercel's npm included, as
// of this writing) gate dependency install scripts behind an approval step
// ("npm warn allow-scripts ... not yet covered by allowScripts"), which can
// leave `prisma`/`@prisma/client`'s own setup incomplete even though our
// root-level `postinstall` script did run. `prisma generate` is idempotent
// and fetches whatever engine binaries it needs on its own, so re-running
// it here is cheap and makes the build resilient to that regardless of the
// exact cause.
import { execSync } from "node:child_process";

console.log("[prebuild] Generating Prisma client…");
execSync("npx prisma generate", { stdio: "inherit" });
