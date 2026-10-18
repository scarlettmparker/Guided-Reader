/**
 * @fileoverview Seeds cassini load-test users: N accounts sharing one password,
 * each with a handful of viewed texts. Idempotent, since it nukes the prefix
 * first.
 *
 *   USERS=25 VIEWS=10 bun seed.ts
 */

import { nuke } from "./nuke.ts";
import { psql, query } from "./db.ts";

const users = Number(process.env.USERS ?? 25);
const views = Number(process.env.VIEWS ?? 10);
const prefix = process.env.PREFIX ?? "loadtest";
const password = process.env.PASSWORD ?? "loadtest-pass";

if (!Number.isInteger(users) || users < 1) {
  throw new Error(`USERS must be a positive integer, got ${process.env.USERS}`);
}

const textIds = await query("select id from hades_reader_texts order by id");
if (views > 0 && !textIds.length) {
  throw new Error("no reader texts to attach views to");
}

await nuke(prefix);

const hash = await Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
const people: string[] = [];
const accounts: string[] = [];
const viewRows: string[] = [];

for (let i = 1; i <= users; i++) {
  const personId = crypto.randomUUID();
  const accountId = crypto.randomUUID();
  const username = `${prefix}-${i}`;
  people.push(`('${personId}','Load','Test','${username}')`);
  accounts.push(
    `('${accountId}','${username}','${hash}','${personId}','ACTIVE','local','HUMAN')`,
  );
  for (let v = 0; v < views; v++) {
    const textId = textIds[(i * views + v) % textIds.length];
    viewRows.push(`('${accountId}','${textId}')`);
  }
}

const script = [
  "begin;",
  `insert into fates_people (id, first_name, last_name, display_name) values\n  ${people.join(",\n  ")};`,
  `insert into gaia_accounts (id, username, password_hash, person_id, status, provider, account_type) values\n  ${accounts.join(",\n  ")};`,
  ...(viewRows.length
    ? [
        `insert into hades_text_views (account_id, text_id) values\n  ${viewRows.join(",\n  ")};`,
      ]
    : []),
  "commit;",
].join("\n");

await psql(script);

console.log(
  `seeded ${users} user(s) ${prefix}-1..${users} (password "${password}"), ${views} view(s) each`,
);
