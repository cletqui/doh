import { Hono } from "hono";

const ip = new Hono();

ip.get("/:ip", async (c) => {
  const ip = c.req.param("ip");
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  const json = await response.json();
  return c.json(json);
});

export default ip;
