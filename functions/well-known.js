
import { readKVFirst } from "../static/kv.js"

export default {
  async fetch(request, env) {
    // adjust the destination server
    const url = new URL(request.url);
    url.hostname = env.ORIGIN_SERVER;
    return readKVFirst(env, url.toString());
  }
}

