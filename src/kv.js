// src/kv.js
export async function readKVFirst(env, redir) {
  async function gatherResponse(response) {
    const { headers } = response;
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return JSON.stringify(await response.json());
    }
    return response.text();
  }
  try {
    const destination = new URL(redir);
    const enc = new TextEncoder().encode(destination.href);
    const sum = await crypto.subtle.digest({ name: "SHA-256" }, enc);
    const internal_seq = btoa(String.fromCharCode(...new Uint8Array(sum)));
    const KV = env.PINK_ELEPHANTS;
    const from_cache = await KV.get(internal_seq);
    if (from_cache != null) {
      return new Response(from_cache, {
        headers: {
          "Content-Type": "text/html; charset=utf-8"
        }
      });
    }
    const response = await fetch(destination, {
      cf: { cacheTtl: 5, cacheEverything: true }
    });
    const results = await gatherResponse(response);
    await KV.put(internal_seq, results, { expirationTtl: 3600 });
    return new Response(results, {
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    });
  } catch (err) {
    return new Response("Error parsing content", { status: 400 });
  }
}

