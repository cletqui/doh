import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";
import resolvers from "../../resolvers.json";

const dnsQuery = new OpenAPIHono();

/**
 * Fetches DNS information for a specific domain and type, returning a DoH JSON.
 * @param {string} resolver - The DoH resolver (Cloudflare, Google, Quad9).
 * @param {string} name - The query name.
 * @param {string} type - The query type.
 * @param {boolean} DO - The DO bot (DNSSEC data).
 * @param {boolean} CD - The CD bit (disable validation).
 * @returns {Promise<object>} - A JSON of DNS data.
 */
async function dohQuery(
  resolver: string,
  name: string,
  type: string,
  DO: boolean,
  CD: boolean
): Promise<object> {
  const endpoint = (resolvers as any)[resolver];
  const url = `https://${endpoint}?name=${name}${type ? `&type=${type}` : ""}${
    DO ? `do=${DO}` : ""
  }${CD ? `$cd=${CD}` : ""}`;
  console.log(url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/dns-json",
    },
  });
  console.log(response.ok, response.status, response.statusText); // TODO handle returned errors
  return await response.json();
}

/* SWAGGER */

const ParamsSchema = z.object({
  resolver: z
    .string()
    .default("cloudflare")
    .openapi({
      param: {
        name: "resolver",
        in: "path",
      },
      default: "cloudflare",
      example: "cloudflare",
      title: "Resolver",
    }),
});

const QuerySchema = z.object({
  name: z.string({ required_error: "Name is required." }).openapi({
    param: {
      name: "name",
      in: "query",
    },
    example: "example.com",
    title: "Query name",
  }),
  type: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "type",
        in: "query",
      },
      default: "A",
      example: "A",
      title: "Query type",
    }),
  DO: z
    .boolean()
    .optional()
    .openapi({
      param: { name: "DO", in: "query" },
      default: false,
      example: false,
      title: "DO bit (DNSSEC data)",
    }),
  CD: z
    .boolean()
    .optional()
    .openapi({
      param: { name: "CD", in: "query" },
      default: false,
      example: false,
      title: "CD bit (disable validation)",
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

const route = createRoute({
  method: "get",
  path: "/{resolver}",
  request: { params: ParamsSchema, query: QuerySchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: DoHSchema,
        },
      },
      description: "Fetch DoH information",
    },
  },
});

/* ROUTE */

dnsQuery.openapi(route, async (c: any) => {
  const { name, type, DO, CD } = c.req.valid("query");
  const { resolver } = c.req.valid("param");
  const response = await dohQuery(resolver, name, type, DO, CD);
  return c.json(response);
});

export default dnsQuery;
