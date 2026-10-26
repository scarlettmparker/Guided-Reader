import { test as base, expect } from "@playwright/test";

import { resetAppCache } from "./app";
import { createDb, type Db } from "./db";
import { readFixture, type E2eFixture } from "./fixture";

type E2eFixtures = {
  /**
   * Account and credentials seeded for the suite.
   */
  e2e: E2eFixture;
};

type E2eWorkerFixtures = {
  /**
   * Shared Postgres connection for the worker.
   */
  db: Db;
};

export const test = base.extend<E2eFixtures, E2eWorkerFixtures>({
  e2e: async ({}, use) => {
    await use(readFixture());
  },
  db: [
    async ({}, use) => {
      const db = await createDb();
      await use(db);
      await db.close();
    },
    { scope: "worker" },
  ],
});

test.beforeEach(async ({ request }) => {
  await resetAppCache(request);
});

export { expect };
