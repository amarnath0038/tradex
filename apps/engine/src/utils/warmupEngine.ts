// apps/engine/src/utils/warmupEngine.ts

import { db, users } from "@repo/db";

export const warmupEngine = async () => {
  console.log("Warming engine...");

  const dbStart = Date.now();

  await db
    .select({ id: users.id })
    .from(users)
    .limit(1);

  console.log(
    "DB warmup took",
    ((Date.now() - dbStart) / 1000).toFixed(2),
    "s"
  );

  console.log("Engine warmup complete");
};
