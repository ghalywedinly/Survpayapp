import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// `db` is a Proxy rather than a real PrismaClient instance so that
// `new PrismaClient()` never runs at module-import time. Next.js imports
// every route module during the build's "Collecting page data" step just to
// catalog its exports — it doesn't invoke the route — but importing this
// file still used to eagerly construct a client, which meant a build could
// fail (or succeed) purely based on whatever state DATABASE_URL happened to
// be in at build time, with nothing actually querying the database. Real
// construction now happens lazily, the first time a request actually
// touches `db.<model>...`, by which point runtime env vars are resolved.
let client: PrismaClient | undefined = globalForPrisma.prisma;

function getClient(): PrismaClient {
  if (!client) {
    client = createClient();
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  }
  return client;
}

export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver);
  },
}) as PrismaClient;
