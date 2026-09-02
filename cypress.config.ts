import { defineConfig } from "cypress";
import pg from "pg";

/**
 * Cypress configuration for Guided-Reader functional tests.
 *
 * The app + backend + DB are brought up by docker-compose.e2e.yml. In the
 * container, baseUrl is http://app:3000; on the host it's http://localhost:3000.
 */
const captureOutputs = process.env.CYPRESS_CAPTURE_OUTPUTS === "true";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{ts,tsx}",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    screenshotsFolder: "cypress-results/screenshots",
    videosFolder: "cypress-results/videos",
    video: captureOutputs,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    retries: 0,
    setupNodeEvents(on) {
      let client: pg.Client | null = null;

      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        async dbReset() {
          const connectionString =
            process.env.DATABASE_URL ||
            "postgres://sun:sun@localhost:5432/sun_test";
          if (!client) {
            client = new pg.Client({ connectionString });
            await client.connect();
          }
          const { rows } = await client.query(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`,
          );
          if (rows.length > 0) {
            const list = rows.map((r) => `"${r.tablename}"`).join(", ");
            await client.query(
              `TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`,
            );
          }
          return null;
        },
      });
    },
  },
});
