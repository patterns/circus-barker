// forward GET to origin server unless KV record exists
import { readKVFirst } from "../src/kv.js"

const read = ({request, env}) => {
    // adjust the destination server
    const url = new URL(request.url);
    url.hostname = env.ORIGIN_SERVER;
    return readKVFirst(env, url.toString());
};
export const onRequestGet = [read];
