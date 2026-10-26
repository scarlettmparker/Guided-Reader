import bcrypt from "bcryptjs";
import pg from "pg";

import { DATABASE_URL, E2E_PASSWORD } from "./env";

const { Client } = pg;

export type Db = {
  /**
   * Runs a query and returns the resulting rows.
   *
   * @param sql the SQL to run
   * @param values bound parameters
   * @returns the resulting rows
   */
  query: <T extends pg.QueryResultRow>(sql: string, values?: unknown[]) => Promise<T[]>;
  /**
   * Creates the E2E reader account and returns its account id.
   *
   * @param username the login username
   * @returns the new account id
   */
  createReader: (username: string) => Promise<string>;
  /**
   * Deletes the E2E reader account and its person row.
   *
   * @param accountId the account to remove
   */
  deleteReader: (accountId: string) => Promise<void>;
  /**
   * Clears reader content created by the suite.
   */
  resetReaderData: () => Promise<void>;
  /**
   * Closes the underlying connection.
   */
  close: () => Promise<void>;
};

/**
 * Opens a Postgres connection to the disposable E2E database.
 *
 * @returns the connected database helper
 */
export async function createDb(): Promise<Db> {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  const query = async <T extends pg.QueryResultRow>(
    sql: string,
    values: unknown[] = [],
  ): Promise<T[]> => {
    const result = await client.query<T>(sql, values);
    return result.rows;
  };

  return {
    query,
    async createReader(username) {
      const accountId = crypto.randomUUID();
      const personId = crypto.randomUUID();

      await query(
        `INSERT INTO fates_people (id, first_name, last_name, display_name, email)
         VALUES ($1, 'E2E', 'Reader', $2, $3)`,
        [personId, username, `${username}@example.com`],
      );
      await query(
        `INSERT INTO gaia_accounts
           (id, account_type, password_hash, person_id, status, username, provider)
         VALUES ($1, 'HUMAN', $2, $3, 'ACTIVE', $4, 'local')`,
        [accountId, bcrypt.hashSync(E2E_PASSWORD, 10), personId, username],
      );
      await query(
        `INSERT INTO hades_reader_accounts
           (id, discord_id, discord_username, global_name, gaia_account_id)
         VALUES ($1, $2, $3, $3, $4)`,
        [crypto.randomUUID(), `e2e-${username}`, username, accountId],
      );

      return accountId;
    },
    async deleteReader(accountId) {
      await query("DELETE FROM hades_reader_accounts WHERE gaia_account_id = $1", [accountId]);
      const rows = await query<{ person_id: string }>(
        "DELETE FROM gaia_accounts WHERE id = $1 RETURNING person_id",
        [accountId],
      );
      if (rows[0]) {
        await query("DELETE FROM fates_people WHERE id = $1", [rows[0].person_id]);
      }
    },
    async resetReaderData() {
      await query(`
        CREATE TABLE IF NOT EXISTS hades_reader_text_counts (
          status varchar(255) PRIMARY KEY,
          total bigint NOT NULL DEFAULT 0
        )
      `);
      await query(`
        CREATE OR REPLACE FUNCTION hades_reader_text_count_change() RETURNS trigger AS $$
        BEGIN
          IF TG_OP = 'INSERT' THEN
            INSERT INTO hades_reader_text_counts (status, total) VALUES (NEW.status, 1)
            ON CONFLICT (status) DO UPDATE SET total = hades_reader_text_counts.total + 1;
          ELSIF TG_OP = 'DELETE' THEN
            UPDATE hades_reader_text_counts SET total = GREATEST(total - 1, 0) WHERE status = OLD.status;
          ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
            UPDATE hades_reader_text_counts SET total = GREATEST(total - 1, 0) WHERE status = OLD.status;
            INSERT INTO hades_reader_text_counts (status, total) VALUES (NEW.status, 1)
            ON CONFLICT (status) DO UPDATE SET total = hades_reader_text_counts.total + 1;
          END IF;
          RETURN NULL;
        END;
        $$ LANGUAGE plpgsql
      `);
      await query("DROP TRIGGER IF EXISTS hades_reader_text_count_trigger ON hades_reader_texts");
      await query(`
        CREATE TRIGGER hades_reader_text_count_trigger
        AFTER INSERT OR UPDATE OR DELETE ON hades_reader_texts
        FOR EACH ROW EXECUTE FUNCTION hades_reader_text_count_change()
      `);
      await query(
        `TRUNCATE TABLE
           hades_reader_comments,
           hades_reader_annotations,
           hades_reader_positions,
           hades_text_views,
           hades_reader_texts,
           hades_reader_text_counts,
           hades_reader_sources
         RESTART IDENTITY CASCADE`,
      );
    },
    close: () => client.end(),
  };
}
