import { existsSync, rmSync } from "node:fs";

import { createDb } from "./db";
import { FIXTURE_PATH, STORAGE_STATE_PATH, readFixture } from "./fixture";

/**
 * Removes the E2E reader and its generated auth files.
 */
async function globalTeardown(): Promise<void> {
  if (!existsSync(FIXTURE_PATH)) return;

  const db = await createDb();

  try {
    const fixture = readFixture();
    await db.deleteReader(fixture.accountId);
  } finally {
    await db.close();
  }

  rmSync(FIXTURE_PATH, { force: true });
  rmSync(STORAGE_STATE_PATH, { force: true });
}

export default globalTeardown;
