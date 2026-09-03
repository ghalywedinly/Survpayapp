import { NextRequest, NextResponse } from "next/server";
import { runSeed } from "../../../../../prisma/seed-logic";

// One-time admin endpoint: wipes and re-seeds the database with demo data.
// Exists for deployments (e.g. a serverless preview) where the database is
// only reachable from the running app, not from wherever `npm run db:seed`
// would otherwise be invoked. Gated behind a key so it can't be hit by
// accident; the key defaults to a fixed, low-stakes value (this only ever
// touches demo data, never anything a real user created) unless a
// deployment sets its own SEED_SECRET env var. Not linked from anywhere in
// the UI — visit it directly once.
const DEFAULT_SEED_KEY = "survpay-demo-seed";

export async function GET(req: NextRequest) {
  const secret = process.env.SEED_SECRET || DEFAULT_SEED_KEY;
  const key = req.nextUrl.searchParams.get("key");
  if (key !== secret) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runSeed();
    return NextResponse.json({
      ok: true,
      ...result,
      message: `Seeded ${result.surveys} surveys, ${result.totalResponses} responses. Demo login: demo@survpay.com / Demo1234!`,
    });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
