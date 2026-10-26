import { mkdirSync, writeFileSync } from "node:fs";

import { loginAs, saveStorageState } from "./auth";
import { createDb } from "./db";
import { E2E_PASSWORD, E2E_USERNAME } from "./env";
import { AUTH_DIR, FIXTURE_PATH, STORAGE_STATE_PATH, type E2eFixture } from "./fixture";

/**
 * Creates the E2E reader and writes its auth storage state.
 */
async function globalSetup(): Promise<void> {
  mkdirSync(AUTH_DIR, { recursive: true });

  const db = await createDb();

  try {
    const existing = await db.query<{ id: string }>(
      "SELECT id FROM gaia_accounts WHERE username = $1",
      [E2E_USERNAME],
    );
    if (existing[0]) {
      await db.deleteReader(existing[0].id);
    }

    const accountId = await db.createReader(E2E_USERNAME);
    const fixture: E2eFixture = {
      accountId,
      username: E2E_USERNAME,
      password: E2E_PASSWORD,
    };

    writeFileSync(FIXTURE_PATH, JSON.stringify(fixture, null, 2));

    const token = await loginAs(E2E_USERNAME, E2E_PASSWORD);
    await saveStorageState(token, STORAGE_STATE_PATH);
  } catch (error) {
    throw new Error(
      `E2E setup failed. Start the disposable stack first: ./vm/e2e/reset-db.sh then ./vm/e2e/start-backend.sh\n${String(error)}`,
    );
  } finally {
    await db.close();
  }
}

export default globalSetup;
