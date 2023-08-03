import { Hono } from "hono";
////const app = new Hono();

type Bindings = {
  ORIGIN_SERVER: string
  PINK_ELEPHANTS: KVNamespace
};
const app = new Hono<{ Bindings: Bindings }>();

//todo
// 1. extract req url
// 2. calculate hash of the req url
// 3. look up KV value with hash as key
// 4. if exists, return the value as response content
// 5. otherwise, fetch from origin server (rpi)
// 6. replace any links refering to the origin server
// 7. save a copy of the content result in KV using expiration of wk
// 8. return the content result
async function readKVFirst(context, redir) {

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
    const KV = context.env.PINK_ELEPHANTS;
    const from_cache = await KV.get(internal_seq);
    if (from_cache != null) {
      // TODO short-circuit when wrong format from public key (save consumer grief)
      return context.html(from_cache);
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
    return context.html(results);

  } catch (err) {
    return new Response('Error parsing JSON content', { status: 400 });
  }
}

app.get("/static/*", async (ctx) => {
  return await ctx.env.ASSETS.fetch(ctx.req);
});
app.get("/voyage", async (ctx) => {
  let redir = "https://" + ctx.env.ORIGIN_SERVER + "/voyage";
  return await readKVFirst(ctx, redir);
});
app.get("/tabla", async (ctx) => {
  let redir = "https://" + ctx.env.ORIGIN_SERVER + "/tabla";
  return await readKVFirst(ctx, redir);
});
app.get("/", async (ctx) => {
  let redir = "https://" + ctx.env.ORIGIN_SERVER;
  return await readKVFirst(ctx, redir);
});


////app.route("/", peop);
export default app;

