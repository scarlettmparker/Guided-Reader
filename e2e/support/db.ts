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
   * Deletes reader activity for an account.
   *
   * @param accountId the account to clear
   */
  resetReaderData: (accountId: string) => Promise<void>;
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
    async resetReaderData(accountId) {
      await query("DELETE FROM hades_text_views WHERE account_id = $1", [accountId]);
    },
    close: () => client.end(),
  };
}
