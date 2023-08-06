import honeycombPlugin from "@cloudflare/pages-plugin-honeycomb";

export const onRequest: PagesFunction<{
  HONEYCOMB_API_KEY: string
  HONEYCOMB_DATASET: string
}> = (context) => {
  return honeycombPlugin({
    apiKey: context.env.HONEYCOMB_API_KEY,
    dataset: context.env.HONEYCOMB_DATASET,
  })(context);
}
