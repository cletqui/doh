import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";

/* CRT */

const ParamsSchema = z.object({
  domain: z.string({ required_error: "Domain is required." }).openapi({
    param: {
      name: "domain",
      in: "path",
    },
    example: "example.com",
    title: "Domain name",
  }),
});

const QuerySchema = z.object({
  exclude: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "exclude",
        in: "query",
      },
      example: "expired",
      title: "Exclude expired certificates",
    }),
  deduplicate: z
    .string()
    .optional()
    .openapi({
      param: {
        name: "deduplicate",
        in: "query",
      },
      example: "Y",
      title: "Deduplicate certificate pairs",
    }),
}); // TODO refactor the parameters and add "limit" parameter

interface CrtResponse {
  issuer_ca_id: number;
  issuer_name: string;
  common_name: string;
  name_value: string;
  id: number;
  entry_timestamp: string | null;
  not_before: string;
  not_after: string;
  serial_number: string;
  result_count: number;
}

const CrtResponseSchema = z
  .array(
    z.object({
      issuer_ca_id: z.number().openapi({ example: 185752 }),
      issuer_name: z.string().openapi({
        example:
          "C=US, O=DigiCert Inc, CN=DigiCert Global G2 TLS RSA SHA256 2020 CA1",
      }),
      common_name: z.string().openapi({ example: "www.example.org" }),
      name_value: z
        .string()
        .openapi({ example: "example.com\nwww.example.com" }),
      id: z.number().openapi({ example: 12337892544 }),
      entry_timestamp: z
        .string()
        .nullable()
        .openapi({ example: "2024-03-10T20:13:50.549" }),
      not_before: z
        .string()
        .datetime()
        .openapi({ example: "2024-01-30T00:00:00" }),
      not_after: z
        .string()
        .datetime()
        .openapi({ example: "2025-03-01T23:59:59" }),
      serial_number: z
        .string()
        .openapi({ example: "075bcef30689c8addf13e51af4afe187" }),
      result_count: z.number().openapi({ example: 2 }),
    })
  )
  .openapi("Certificates");

async function query(domain: string): Promise<CrtResponse[]> {
  const url = `https://crt.sh/?Identity=${domain}&output=json`;
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
  return (await response.json()) as CrtResponse[];
}

const crtRoute = createRoute({
  tags: ["Domain"],
  method: "get",
  path: "/{domain}",
  request: { params: ParamsSchema, query: QuerySchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CrtResponseSchema,
        },
      },
      description: "Fetch crt.sh data",
    },
  },
  description: "Certificate Transparency",
  externalDocs: { description: "crt.sh", url: "https://crt.sh/" },
});

export const crt = new OpenAPIHono();

crt.openapi(crtRoute, async (c: any) => {
  const { domain } = c.req.valid("param");
  const response = await query(domain);
  return c.json(response);
});
