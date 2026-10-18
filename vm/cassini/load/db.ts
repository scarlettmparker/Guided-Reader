/**
 * @fileoverview Postgres access for the cassini load scripts. The connection
 * comes from the standard PG* environment variables.
 */

/**
 * Connection details psql needs.
 */
export interface DbConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

/**
 * Resolves the target database from the PG* environment.
 *
 * @returns The connection to use, defaulting to the local dev database.
 */
export function dbConfig(): DbConfig {
  return {
    host: process.env.PGHOST ?? "localhost",
    port: process.env.PGPORT ?? "5432",
    user: process.env.PGUSER ?? "postgres",
    password: process.env.PGPASSWORD ?? "",
    database: process.env.PGDATABASE ?? "sun",
  };
}

/**
 * Runs a SQL script through psql, aborting on the first error.
 *
 * @param sql - The statements to run.
 * @returns psql's stdout.
 */
export async function psql(sql: string): Promise<string> {
  const { host, port, user, password, database } = dbConfig();
  const file = `/tmp/opencode/load-${crypto.randomUUID()}.sql`;
  await Bun.write(file, sql);
  const proc = Bun.spawn(
    [
      "psql",
      "-h",
      host,
      "-p",
      port,
      "-U",
      user,
      "-d",
      database,
      "-v",
      "ON_ERROR_STOP=1",
      "-q",
      "-f",
      file,
    ],
    {
      env: { ...process.env, PGPASSWORD: password },
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  await Bun.file(file)
    .delete()
    .catch(() => {});
  if (code !== 0) throw new Error(`psql failed (${code}): ${stderr.trim()}`);
  return stdout;
}

/**
 * Runs a single query and returns one value per line.
 *
 * @param sql - The query to run.
 * @returns Trimmed, unaligned rows.
 */
export async function query(sql: string): Promise<string[]> {
  const { host, port, user, password, database } = dbConfig();
  const proc = Bun.spawn(
    [
      "psql",
      "-h",
      host,
      "-p",
      port,
      "-U",
      user,
      "-d",
      database,
      "-tA",
      "-c",
      sql,
    ],
    {
      env: { ...process.env, PGPASSWORD: password },
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  const [stdout, stderr, code] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);
  if (code !== 0) throw new Error(`psql failed (${code}): ${stderr.trim()}`);
  return stdout.split("\n").filter(Boolean);
}
