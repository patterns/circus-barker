import { Hono } from "hono";
const app = new Hono();

app.get("/", (ctx) => ctx.text("Hello world, this is Hono on CF !"));
app.get("/public/*", async (ctx) => {
  return await ctx.env.ASSETS.fetch(ctx.req);
});
export default app;

