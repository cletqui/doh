import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";

/* WHOIS */

const ParamsSchema = z.object({
  domain: z.string({ required_error: "Domain is required." }).openapi({
    param: {
      name: "domain",
      in: "path",
    },
    example: "google.com",
    title: "Domain name",
  }),
});

interface WhoisResponse {} // TODO

const WhoisResponseSchema = z.object({}); // TODO

async function query(domain: string): Promise<WhoisResponse> {
  const url = `https://rdap.org/domain/${domain}`;
  console.log(url);
  const response = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch data: ${response.status} ${response.statusText}`
    );
  } // TODO handle returned errors
  return (await response.json()) as WhoisResponse;
}

const whoisRoute = createRoute({
  tags: ["Domain"],
  method: "get",
  path: "/{domain}",
  request: { params: ParamsSchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: WhoisResponseSchema,
        },
      },
      description: "Fetch whois data",
    },
  },
});

export const whois = new OpenAPIHono();

whois.openapi(whoisRoute, async (c: any) => {
  const { domain } = c.req.valid("param");
  const response = await query(domain);
  return c.json(response);
});
