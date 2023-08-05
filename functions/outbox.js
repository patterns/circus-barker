// forward POST request to origin 

export async function onRequestPost(context) {
  const { request, env } = context;
  console.log(`RCV POST: ${request.url}`);
  // specify fields on new constructor
    const newRequestInit = {
      redirect: "follow",
    };
    // adjust the destination server
    const url = new URL(request.url);
    url.hostname = env.ORIGIN_SERVER;
    const newRequest = new Request(
      url.toString(),
      new Request(request, newRequestInit),
    );
    try {
      return await fetch(newRequest);
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      });
    }
}


