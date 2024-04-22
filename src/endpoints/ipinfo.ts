import { Hono } from "hono";

const ipinfo = new Hono();

ipinfo.get("/:ip", async (c) => {
  const ip = c.req.param("ip");
  const response = await fetch(`http://ip-api.com/json/${ip}`);
  const json = await response.json();
  return c.json(json);
});

export default ipinfo;
