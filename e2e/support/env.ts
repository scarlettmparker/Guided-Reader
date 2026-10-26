/**
 * URLs and credentials used by the Playwright suite.
 */

/**
 * Guided-Reader origin under test.
 */
export const APP_URL = process.env.APP_URL ?? "http://127.0.0.1:5200";

/**
 * Sun GraphQL backend used for login and fixtures.
 */
export const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8085";

/**
 * Disposable Postgres connection.
 */
export const DATABASE_URL = process.env.DATABASE_URL ?? "postgres://sun:sun@127.0.0.1:5436/sun_e2e";

/**
 * Seeded E2E account username.
 */
export const E2E_USERNAME = process.env.E2E_USERNAME ?? "e2e-reader";

/**
 * Password shared by the seeded E2E account.
 */
export const E2E_PASSWORD = process.env.E2E_PASSWORD ?? "password1234!";
