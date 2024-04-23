import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";

const nslookup = new OpenAPIHono();

/**
 * Fetches DNS information for a specific domain and type, returning an array of data.
 * @param {string} name - The domain name for which DNS information is requested.
 * @param {string} type - The type of DNS information to retrieve.
 * @param {string} resolver - The DoH resolver to use (Cloudflare or Google).
 * @returns {Promise<string[] | null>} - An array of DNS data if Answer exists and is not from Authority, otherwise null.
 */
async function dohQuery(
  name: string,
  type: string,
  resolver: string
): Promise<string[]> {
  const endpoint =
    resolver === "google"
      ? "dns.google/resolve"
      : resolver === "quad9"
      ? "dns.quad9.net:5053/dns-query"
      : "cloudflare-dns.com/dns-query";
  const response = await fetch(
    `https://${endpoint}?name=${name}&type=${type}`,
    {
      method: "GET",
      headers: {
        Accept: "application/dns-json",
        "User-Agent": "doh",
      },
    }
  );
  console.log(response.ok, response.status, response.statusText);
  return await response.json();
}

/* SWAGGER */

const QuerySchema = z.object({
  name: z.string({ required_error: "Name is required." }).openapi({
    param: {
      name: "name",
      in: "path",
    },
    example: "example.com",
    title: "Name",
  }),
  resolver: z
    .string()
    .optional()
    .default("cloudflare")
    .openapi({
      param: {
        name: "resolver",
        in: "query",
      },
      default: "cloudflare",
      example: "cloudflare",
      title: "Resolver",
    }),
  type: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "type",
        in: "query",
      },
      example: "A",
      title: "Type",
    }),
});

const DoHSchema = z
  .object({
    Status: z.number().openapi({ example: 0 }),
    TC: z.boolean().openapi({ example: false }),
    RD: z.boolean().openapi({ example: true }),
    RA: z.boolean().openapi({ example: true }),
    AD: z.boolean().openapi({ example: true }),
    CD: z.boolean().openapi({ example: false }),
    Question: z.array(
      z.object({
        name: z.string().openapi({ example: "example.com." }),
        type: z.number().openapi({ example: 28 }),
      })
    ),
    Answer: z.array(
      z.object({
        name: z.string().openapi({ example: "example.com." }),
        type: z.number().openapi({ example: 28 }),
        TTL: z.number().openapi({ example: 1726 }),
        data: z
          .string()
          .openapi({ example: "2606:2800:220:1:248:1893:25c8:1946" }),
      })
    ),
  })
  .openapi("DoH");

const NslookupSchema = z
  .object({
    domain: z.string().openapi({ example: "example.com" }),
    A: DoHSchema,
    AAAA: DoHSchema,
    CNAME: DoHSchema,
    TXT: DoHSchema,
    NS: DoHSchema,
    MX: DoHSchema,
  })
  .openapi("Nslookup");

const route = createRoute({
  method: "get",
  path: "",
  request: { query: QuerySchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: NslookupSchema,
        },
      },
      description: "Fetch DNS information",
    },
  },
});

/* ROUTE */

nslookup.openapi(route, async (c: any) => {
  const { name, resolver, type } = c.req.valid("query");
  console.log(name, resolver, type); // TODO implement type selection
  const [A, AAAA, CNAME, TXT, NS, MX] = await Promise.all([
    dohQuery(name, "A", resolver),
    dohQuery(name, "AAAA", resolver),
    dohQuery(name, "CNAME", resolver),
    dohQuery(name, "TXT", resolver),
    dohQuery(name, "NS", resolver),
    dohQuery(name, "MX", resolver),
  ]);
  return c.json({ name, resolver, A, AAAA, CNAME, NS, MX, TXT });
});

export default nslookup;
