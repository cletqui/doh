import { Hono } from "hono";

const dns = new Hono();

dns.get("/:domain", async (c) => {
  const domain = c.req.param("domain");
  console.log(domain);
  const response = await fetch(
    `https://1.1.1.1/dns-query?name=${domain}&type=A`,
    {
      method: "GET",
      headers: {
        accept: "application/dns-json",
      },
    }
  );
  console.log(response);
  const json = await response.json();
  console.log(json);
  return c.json(json);
});

export default dns;
