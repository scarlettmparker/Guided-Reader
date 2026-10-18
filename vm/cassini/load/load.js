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

// Optional fixed arrival rate for readers. 0 keeps constant-VU behaviour.
const ARRIVAL_RATE = Number(__ENV.ARRIVAL_RATE || 0);
// Comma-separated asset paths, supplied by run.sh from the build output.
const ASSETS = (__ENV.ASSETS || "")
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

const WRITERS = Math.max(1, Math.round(USERS * WRITE_SHARE));
const READERS = Math.max(1, USERS - WRITERS);

const readScenario =
  ARRIVAL_RATE > 0
    ? {
        executor: "constant-arrival-rate",
        exec: "reader",
        rate: ARRIVAL_RATE,
        timeUnit: "1s",
        duration: DURATION,
        preAllocatedVUs: READERS,
        maxVUs: Math.max(READERS * 3, READERS + 10),
        gracefulStop: "10s",
      }
    : {
        executor: "constant-vus",
        exec: "reader",
        vus: READERS,
        duration: DURATION,
        gracefulStop: "10s",
      };

export const options = {
  insecureSkipTLSVerify: true,
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  scenarios: {
    readers: readScenario,
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
    "http_req_duration{kind:asset}": ["p(95)<200"],
  },
};

// The app returns both cookies in one Set-Cookie header, which k6's jar drops
// past the first iteration, so carry them ourselves.
let cookieHeader = "";
let csrf = "";
let texts = null;

/**
 * Reads a cookie value out of a combined Set-Cookie header.
 *
 * @param header - The raw Set-Cookie header.
 * @param name - Cookie name.
 * @returns The value, or null.
 */
function cookieValue(header, name) {
  const match = new RegExp(`${name}=([^;,\\s]+)`).exec(header || "");
  return match ? match[1] : null;
}

/**
 * The headers every JSON POST needs.
 *
 * @returns Header map.
 */
function headers() {
  return {
    "content-type": "application/json",
    "x-csrf-token": csrf,
    cookie: cookieHeader,
    Origin: BASE,
  };
}

/**
 * Signs this VU in as its own account, once per VU lifetime, and keeps the
 * session cookies for the rest of the run.
 */
function ensure() {
  if (cookieHeader) return;
  const index = ((exec.vu.idInTest - 1) % USERS) + 1;
  const username = `${PREFIX}-${index}`;
  const res = http.post(
    `${BASE}/__login`,
    { username, password: PASSWORD },
    {
      headers: { Origin: BASE },
      redirects: 0,
      responseCallback: http.expectedStatuses(302),
      tags: { name: "POST /__login", kind: "auth" },
    },
  );
  check(res, { "login 302": (r) => r.status === 302 });

  const setCookie = res.headers["Set-Cookie"] || "";
  const auth = cookieValue(setCookie, "reader_auth");
  const token = cookieValue(setCookie, "csrf_token");
  if (!auth || !token) throw new Error(`login for ${username} returned no session`);
  csrf = token;
  cookieHeader = `reader_auth=${auth}; csrf_token=${token}`;
  http.cookieJar().clear(BASE);
}

/**
 * Reads a JSON path from a response, tolerating non-JSON bodies.
 *
 * @param res - The response.
 * @param path - k6 JSON selector.
 * @returns The value, or undefined.
 */
function json(res, path) {
  try {
    return res.json(path);
  } catch {
    return undefined;
  }
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
  const res = http.post(`${BASE}/__page-data`, JSON.stringify({ pattern, params }), {
    headers: headers(),
    tags: { name, kind: "read" },
  });
  check(res, { [`${name} 200`]: (r) => r.status === 200 });
  return json(res, "data");
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
 * Resolves the assets a session should load: from ASSETS when run.sh supplies
 * them, otherwise from the login page's references.
 *
 * @returns The setup data shared with every VU.
 */
export function setup() {
  if (ASSETS.length) return { assets: ASSETS };
  const res = http.get(`${BASE}/login`, { tags: { name: "setup html" } });
  const found = new Set();
  const re = /\/(?:assets|fonts)\/[A-Za-z0-9._-]+\.(?:js|css|woff2)/g;
  let match;
  while ((match = re.exec(res.body || "")) !== null) found.add(match[0]);
  return { assets: Array.from(found) };
}

let assetsLoaded = false;

/**
 * Loads the page's static assets once per VU.
 *
 * @param assets - Asset paths from setup.
 */
function loadAssets(assets) {
  if (assetsLoaded || !assets || !assets.length) return;
  assetsLoaded = true;
  for (const path of assets) {
    http.get(`${BASE}${path}`, { tags: { name: "GET asset", kind: "asset" } });
  }
}

/**
 * Reader journey: browse the library, list texts, open one, mark it viewed.
 */
export function reader(data) {
  ensure();
  loadAssets(data && data.assets);
  http.get(`${BASE}/library`, {
    headers: { cookie: cookieHeader },
    tags: { name: "GET /library", kind: "read" },
  });
  pageData("library", { pagination: { page: 0, size: 5 } }, "page-data library");

  const id = pickText();
  if (id) {
    http.get(`${BASE}/texts/${id}`, {
      headers: { cookie: cookieHeader },
      tags: { name: "GET /texts/:id", kind: "read" },
    });
    pageData("texts/:id", { id }, "page-data texts/:id");
    http.post(`${BASE}/hades/markViewed`, JSON.stringify({ textId: id }), {
      headers: headers(),
      tags: { name: "hades/markViewed", kind: "write" },
    });
  }
  sleep(THINK_MS / 1000);
}

/**
 * Writer journey: create an annotation on a text, then delete it.
 */
export function writer(data) {
  ensure();
  loadAssets(data && data.assets);
  const id = pickText();
  if (!id) return;

  const created = http.post(
    `${BASE}/hades/createAnnotation`,
    JSON.stringify({
      input: { textId: id, startOffset: 0, endOffset: 5, body: `load ${Date.now()}` },
    }),
    { headers: headers(), tags: { name: "hades/createAnnotation", kind: "write" } },
  );
  check(created, { "createAnnotation 200": (r) => r.status === 200 });

  const annotationId = json(created, "annotation.id");
  if (annotationId) {
    const removed = http.post(
      `${BASE}/hades/deleteAnnotation`,
      JSON.stringify({ id: annotationId }),
      { headers: headers(), tags: { name: "hades/deleteAnnotation", kind: "write" } },
    );
    check(removed, { "deleteAnnotation 200": (r) => r.status === 200 });
  }
  sleep(WRITE_THINK_MS / 1000);
}
