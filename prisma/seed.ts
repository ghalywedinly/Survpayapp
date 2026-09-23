/* eslint-disable no-console */
// CLI entry point — `npm run db:seed`. The actual seeding logic lives in
// seed-logic.ts so it can also be invoked from the admin API route for
// environments where running a shell script against the database isn't an
// option (e.g. this database is only reachable from the deployed app, not
// from wherever `npm run db:seed` would be run).
import { runSeed, seedDb } from "./seed-logic";

runSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await seedDb.$disconnect();
  });
