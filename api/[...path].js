// Vercel's CDN rewrites can only reach external origins on ports 80/443, so the
// backend on :4040 has to be proxied from a Node function instead.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN || "http://110.225.254.51:4040";

// Hop-by-hop headers, plus ones the runtime recomputes. accept-encoding is dropped
// so the origin answers uncompressed and the body always matches the headers we relay.
const SKIP_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "content-length",
  "accept-encoding",
]);

const SKIP_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length",
]);

// Django's APPEND_SLASH redirect cannot carry a POST body over, so the trailing
// slash every DRF route expects must survive Vercel's router normalising the path.
const buildUpstreamUrl = (request) => {
  const incoming = new URL(request.url);
  const lastSegment = incoming.pathname.split("/").pop();
  const pathname =
    incoming.pathname.endsWith("/") || lastSegment.includes(".")
      ? incoming.pathname
      : `${incoming.pathname}/`;

  return `${BACKEND_ORIGIN}${pathname}${incoming.search}`;
};

export default {
  async fetch(request) {
    const headers = new Headers();
    for (const [name, value] of request.headers) {
      if (!SKIP_REQUEST_HEADERS.has(name)) {
        headers.set(name, value);
      }
    }

    const hasBody = request.method !== "GET" && request.method !== "HEAD";

    let upstream;
    try {
      upstream = await fetch(buildUpstreamUrl(request), {
        method: request.method,
        headers,
        body: hasBody ? await request.arrayBuffer() : undefined,
        redirect: "manual",
      });
    } catch (error) {
      return Response.json(
        { detail: "Unable to reach the API server.", error: String(error) },
        { status: 502 },
      );
    }

    const responseHeaders = new Headers();
    for (const [name, value] of upstream.headers) {
      if (!SKIP_RESPONSE_HEADERS.has(name) && name !== "set-cookie") {
        responseHeaders.set(name, value);
      }
    }
    // Multiple Set-Cookie headers collapse into one string when read via get().
    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append("set-cookie", cookie);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  },
};
