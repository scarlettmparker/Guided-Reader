/**
 * @fileoverview Drops every row the load-test seed created: accounts under a
 * prefix, their people, and anything they wrote. Safe to run when nothing
 * exists.
 *
 *   PREFIX=loadtest bun nuke.ts
 */

import { psql, query } from "./db.ts";

/**
 * Deletes all load-test data for a username prefix.
 *
 * @param prefix - Username prefix the seed used.
 * @returns How many accounts were removed.
 */
export async function nuke(prefix = process.env.PREFIX ?? "loadtest"): Promise<number> {
  const pattern = `${prefix}-%`;
  const people = await query(
    `select person_id from gaia_accounts where username like '${pattern}'`,
  );
  const accounts = `(select id from gaia_accounts where username like '${pattern}')`;

  const statements = [
    `delete from hades_reader_comments where created_by in ${accounts}`,
    `delete from hades_reader_annotations where created_by in ${accounts}`,
    `delete from hades_reader_votes where account_id in ${accounts}`,
    `delete from hades_private_notes where owner_id in ${accounts}`,
    `delete from hades_reader_positions where created_by in ${accounts}`,
    `delete from hades_text_views where account_id in ${accounts}`,
    `delete from gaia_account_permissions where account_id in ${accounts}`,
    `delete from gaia_account_roles where account_id in ${accounts}`,
    `delete from gaia_accounts where username like '${pattern}'`,
  ];
  if (people.length) {
    statements.push(
      `delete from fates_people where id in (${people.map((id) => `'${id}'`).join(",")})`,
    );
  }

  await psql(`begin;\n${statements.join(";\n")};\ncommit;`);
  return people.length;
}

if (import.meta.main) {
  const prefix = process.env.PREFIX ?? "loadtest";
  const removed = await nuke(prefix);
  console.log(`nuked ${removed} ${prefix}-* account(s)`);
}
