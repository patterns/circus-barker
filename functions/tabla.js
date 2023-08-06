// forward GET to origin server unless KV record exists
import { readKVFirst } from "../src/kv.js"

export async function onRequestGet(context) {
  const {request, env } = context;
  // adjust the destination server
  const url = new URL(request.url);
  url.hostname = env.ORIGIN_SERVER;
  return readKVFirst(env, url.toString());
};

