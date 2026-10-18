/**
 * @fileoverview k6 load profile for cassini. Each VU is one seeded account and
 * walks a real reader path: sign in, library, text list, open a text, and for
 * writers, create then delete an annotation.
 *
 *   BASE_URL=https://cassini:9178 USERS=50 DURATION=60s k6 run load.js
 *
 * VU and account count are the same number; extend the seed with more accounts
 * to run more VUs.
 */

import http from "k6/http";
import { check, sleep } from "k6";
import exec from "k6/execution";

const BASE = __ENV.BASE_URL || "https://cassini:9178";
const PREFIX = __ENV.PREFIX || "loadtest";
const PASSWORD = __ENV.PASSWORD || "loadtest-pass";
const USERS = Number(__ENV.USERS || 25);
const DURATION = __ENV.DURATION || "30s";
const THINK_MS = Number(__ENV.THINK_MS || 300);

// createAnnotation is rate limited to roughly one per 15s per account, so
// writers pause long enough to stay under it instead of collecting 429s.
const WRITE_THINK_MS = Number(__ENV.WRITE_THINK_MS || 16000);
const WRITE_SHARE = Number(__ENV.WRITE_SHARE ?? 0.2);

const WRITERS = Math.max(1, Math.round(USERS * WRITE_SHARE));
const READERS = Math.max(1, USERS - WRITERS);

export const options = {
  insecureSkipTLSVerify: true,
  scenarios: {
    readers: {
      executor: "constant-vus",
      exec: "reader",
      vus: READERS,
      duration: DURATION,
      gracefulStop: "10s",
    },
    writers: {
      executor: "constant-vus",
      exec: "writer",
      vus: WRITERS,
      duration: DURATION,
      gracefulStop: "10s",
      startTime: "2s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
    "http_req_duration{kind:read}": ["p(95)<500", "p(99)<1000"],
    "http_req_duration{kind:write}": ["p(95)<500", "p(99)<1000"],
  },
};

let csrf = null;
let texts = null;

/**
 * Reads the csrf_token cookie the app issued for this VU.
 *
 * @returns The token, or an empty string before login.
 */
function csrfToken() {
  const cookies = http.cookieJar().cookiesForURL(BASE);
  const token = cookies["csrf_token"];
  return token && token.length ? token[0] : "";
}

/**
 * The headers every JSON POST needs.
 *
 * @returns Header map.
 */
function jsonHeaders() {
  return {
    "content-type": "application/json",
    "x-csrf-token": csrf,
    Origin: BASE,
  };
}

/**
 * Signs this VU in as its own account, once per VU lifetime.
 */
function ensure() {
  if (csrf !== null) return;
  const index = ((exec.vu.idInTest - 1) % USERS) + 1;
  const username = `${PREFIX}-${index}`;
  const res = http.post(
    `${BASE}/__login`,
    { username, password: PASSWORD },
    {
      headers: { Origin: BASE },
      redirects: 0,
      tags: { name: "POST /__login", kind: "auth" },
    },
  );
  check(res, { "login 302": (r) => r.status === 302 });
  csrf = csrfToken();
}

/**
 * Calls a page-data pattern and returns its merged data.
 *
 * @param pattern - Registered loader pattern.
 * @param params - Loader params.
 * @param name - Metric tag for the request.
 * @returns The data object, or null.
 */
function pageData(pattern, params, name) {
  const res = http.post(`${BASE}/__page-data`, { pattern, params }, {
    headers: jsonHeaders(),
    tags: { name, kind: "read" },
  });
  check(res, { [`${name} 200`]: (r) => r.status === 200 });
  return res.json("data");
}

/**
 * Fetches and caches the text ids once per VU.
 *
 * @returns A text id, or null when the list is empty.
 */
function pickText() {
  if (!texts) {
    const data = pageData("texts", { page: 0 }, "page-data texts");
    texts = (data && data.texts && data.texts.items ? data.texts.items : []).map(
      (item) => item.id,
    );
  }
  return texts.length ? texts[Math.floor(Math.random() * texts.length)] : null;
}

/**
 * Reader journey: browse the library, list texts, open one, mark it viewed.
 */
export function reader() {
  ensure();
  http.get(`${BASE}/library`, { tags: { name: "GET /library", kind: "read" } });
  pageData("library", { pagination: { page: 0, size: 5 } }, "page-data library");

  const id = pickText();
  if (id) {
    http.get(`${BASE}/texts/${id}`, {
      tags: { name: "GET /texts/:id", kind: "read" },
    });
    pageData("texts/:id", { id }, "page-data texts/:id");
    http.post(`${BASE}/hades/markViewed`, { textId: id }, {
      headers: jsonHeaders(),
      tags: { name: "hades/markViewed", kind: "write" },
    });
  }
  sleep(THINK_MS / 1000);
}

/**
 * Writer journey: create an annotation on a text, then delete it.
 */
export function writer() {
  ensure();
  const id = pickText();
  if (!id) return;

  const created = http.post(
    `${BASE}/hades/createAnnotation`,
    { input: { textId: id, startOffset: 0, endOffset: 5, body: `load ${Date.now()}` } },
    { headers: jsonHeaders(), tags: { name: "hades/createAnnotation", kind: "write" } },
  );
  check(created, { "createAnnotation 200": (r) => r.status === 200 });

  const annotationId = created.json("annotation.id");
  if (annotationId) {
    const removed = http.post(`${BASE}/hades/deleteAnnotation`, { id: annotationId }, {
      headers: jsonHeaders(),
      tags: { name: "hades/deleteAnnotation", kind: "write" },
    });
    check(removed, { "deleteAnnotation 200": (r) => r.status === 200 });
  }
  sleep(WRITE_THINK_MS / 1000);
}
