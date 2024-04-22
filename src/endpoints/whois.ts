import { Hono } from "hono";

const whois = new Hono();

whois.get("/:name", async (c) => {
  const name = c.req.param("name");
  const response = await fetch(`https://rdap.org/domain/${name}`);
  const json = await response.json();
  return c.json(json);
});

export default whois;
