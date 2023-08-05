// functions/outbox.js

export default {
  async fetch(rcv, env) {
    if (rcv.method !== "POST") {
      return new Response("Not Implemented", {status: 501});
    }
    // specify fields on new constructor
    const newRequestInit = {
      redirect: "follow",
    };
    // adjust the destination server
    const url = new URL(rcv.url);
    url.hostname = env.ORIGIN_SERVER;
    const newRequest = new Request(
      url.toString(),
      new Request(rcv, newRequestInit),
    );
    try {
      return await fetch(newRequest);
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      });
    }
  },
};
