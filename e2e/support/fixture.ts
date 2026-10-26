import { readFileSync } from "node:fs";
import { join } from "node:path";

export type E2eFixture = {
  /**
   * Gaia account id for the E2E reader.
   */
  accountId: string;
  /**
   * Login username.
   */
  username: string;
  /**
   * Login password.
   */
  password: string;
};

/**
 * Directory holding the generated fixture and storage state files.
 */
export const AUTH_DIR = join(import.meta.dirname, "..", ".auth");

/**
 * Fixture metadata written by global setup.
 */
export const FIXTURE_PATH = join(AUTH_DIR, "reader.json");

/**
 * Playwright storage state for the signed-in reader.
 */
export const STORAGE_STATE_PATH = join(AUTH_DIR, "reader-state.json");

/**
 * Reads the fixture metadata written by global setup.
 *
 * @returns the active E2E fixture
 */
export function readFixture(): E2eFixture {
  return JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as E2eFixture;
}
