/**
 * @fileoverview Edge proxy for cassini. Terminates TLS, marks each request
 * https for the production security hook, and rewrites the origin hostname onto
 * the hook's allow-list.
 */

const edgePort = Number(process.env.EDGE_PORT ?? 5178);
const appPort = Number(process.env.APP_PORT ?? 5179);
const certFile = process.env.CERT_FILE ?? "/opt/cassini/tls/cassini.pem";
const keyFile = process.env.KEY_FILE ?? "/opt/cassini/tls/cassini-key.pem";
const upstream = `http://127.0.0.1:${appPort}`;

/**
 * Rewrites a header value's hostname onto localhost.
 *
 * @param value - An Origin or Referer header value.
 * @returns The value with localhost as its host.
 */
function allowedOrigin(value: string): string {
  try {
    const url = new URL(value);
    url.hostname = "localhost";
    return url.origin;
  } catch {
    return "http://localhost";
  }
}

/**
 * Forwards a request to the app.
 *
 * @param request - Incoming request from the Incus proxy.
 * @returns The app's response.
 */
async function forward(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const headers = new Headers(request.headers);
  headers.set("x-forwarded-proto", "https");
  headers.set("x-forwarded-host", request.headers.get("host") ?? "");

  const origin = headers.get("origin");
  if (origin) headers.set("origin", allowedOrigin(origin));
  const referer = headers.get("referer");
  if (referer) headers.set("referer", allowedOrigin(referer));

  try {
    return await fetch(`${upstream}${url.pathname}${url.search}`, {
      method: request.method,
      headers,
      body: request.body,
      redirect: "manual",
    });
  } catch (error) {
    return new Response(`edge: upstream unreachable (${error})`, {
      status: 502,
    });
  }
}

Bun.serve({
  hostname: "0.0.0.0",
  port: edgePort,
  tls: { cert: Bun.file(certFile), key: Bun.file(keyFile) },
  fetch: forward,
});

console.log(`cassini edge listening on :${edgePort} (tls) -> ${upstream}`);
