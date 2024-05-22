import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";

/* https://reversedns.io/api/get-reverse-dns */

const ReverseDnsQuerySchema = z.object({
  ip: z.string({ required_error: "IP is required." }).openapi({
    param: {
      name: "ip",
      in: "query",
    },
    example: "1.1.1.1",
    title: "Query IP",
  }),
});

interface ReverseDnsResponse {
  query: {
    timestamp: string;
    overallProcessingTimeMs: number;
    IPv4: number;
    IPv4_CIDR: [];
    IPv6_CIDR: [];
    IPv4_reverse_found: string;
    IPv6_reverse_found: string;
    detectedBogons: number;
    detectedDuplicates: number;
  };
  cidrDetails: [];
  individualIpDetails: { IPv4: {}; IPv6: {} };
  detectedBogons: [];
  detectedDuplicates: [];
}

const ReverseDnsResponseSchema = z.object({
  query: z.object({
    timestamp: z.string().openapi({ example: "" }),
    overallProcessingTimeMs: z.number().openapi({ example: 0 }),
    IPv4: z.number().openapi({ example: 0 }),
  }),
  cidrDetails: z.array(z.null()).openapi({ example: [] }),
});

async function query(ip: string): Promise<ReverseDnsResponse> {
  const url = "https://reversedns.io/api/get-reverse-dns";
  console.log(url)
  const response = await fetch(url, {
    method: "POST",
    headers: {
      accept: "application/json",
    },
    body: JSON.stringify({ ips: [ip] }),
  });
  console.log(response.ok)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch data: ${response.status} ${response.statusText}`
    );
  }
  return (await response.json()) as ReverseDnsResponse;
}

export const reverseDns = new OpenAPIHono();

const reverseDnsRoute = createRoute({
  tags: ["RDNS"],
  method: "post",
  path: "/",
  request: { query: ReverseDnsQuerySchema },
  responses: {
    // TODO customize error responses (https://github.com/honojs/middleware/tree/main/packages/zod-openapi)
    200: {
      content: {
        "application/json": {
          schema: ReverseDnsResponseSchema,
        },
      },
      description: "Fetch Reverse DNS Records",
    },
  },
});

reverseDns.openapi(reverseDnsRoute, async (c: any) => {
  const { ip } = c.req.valid("query");
  console.log(ip)
  const response: ReverseDnsResponse = await query(ip);
  return c.json(response);
});
