

// 1. extract req url
// 2. calculate hash of the req url
// 3. look up KV value with hash as key
// 4. if exists, return the value as response content
// 5. otherwise, fetch from origin server (rpi)
// 6. replace any links refering to the origin server
// 7. save a copy of the content result in KV using expiration of wk
// 8. return the content result
async function readKVFirst(env, redir) {

  /**
   * gatherResponse awaits and returns a response body as a string.
   * Use await gatherResponse(..) in an async function to get the response body
   * @param {Response} response
   */
  async function gatherResponse(response) {
    const { headers } = response;
    const contentType = headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return JSON.stringify(await response.json());
    }
    return response.text();
  }

  try {

    // TypeError exception is thrown on invalid URLs
    const destination = new URL(redir);

    // use the SHA256 sum as our internal sequence
    const enc = new TextEncoder().encode(destination.href);
    const sum = await crypto.subtle.digest({name: 'SHA-256'}, enc);
    const internal_seq = btoa(String.fromCharCode(...new Uint8Array(sum)));

    // prefer local copy and saving a trip
    const KV = env.PINK_ELEPHANTS;
    const from_cache = await KV.get(internal_seq);
    if (from_cache != null) {
      // TODO short-circuit when wrong format  (save consumer grief)
      return new Response(from_cache, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }

    // retrieve a fresh version (as specified by req url)
    const response = await fetch(destination, {
      cf: {cacheTtl: 5, cacheEverything: true},
    });

    // TODO replace embedded links
    const results = await gatherResponse(response);

    // keep a local copy of the content (48hr = 172800)
    await KV.put(internal_seq, results, {expirationTtl: 3600});

    // pass back fresh (content) to the consumer
    return new Response(results, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
    });
  } catch (err) {
    return new Response('Error parsing content', { status: 400 });
  }
}


export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/voyage') ||
        url.pathname.startsWith('/tabla') ||
        url.pathname.startsWith('/blurb') ||
        url.pathname.startsWith('/table')
        ) {
        let redir = 'https://' + env.ORIGIN_SERVER + url.pathname;
        return readKVFirst(env, redir);
    }
    if (url.pathname === '/' || url.pathname === '') {
        let redir = 'https://' + env.ORIGIN_SERVER;
        return readKVFirst(env, redir);
    }

    // Otherwise, serve static assets.
    return env.ASSETS.fetch(request);
  },
}
