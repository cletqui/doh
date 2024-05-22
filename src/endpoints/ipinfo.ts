import { OpenAPIHono, z, createRoute } from "@hono/zod-openapi";

/* IP INFO */

const ParamsSchema = z.object({
  ip: z.string({ required_error: "IP is required." }).openapi({
    param: {
      name: "ip",
      in: "path",
    },
    example: "162.10.209.81",
    title: "IP",
  }),
});

interface IPInfoResponse {
  ipVersion: number;
  ipAddress: string;
  latitude: number;
  longitude: number;
  countryName: string;
  countryCode: string;
  timeZone: string;
  zipCode: string;
  cityName: string;
  regionName: string;
  continent: string;
  continentCode: string;
  isProxy: boolean;
  currency: {
    code: string;
    name: string;
  };
  language: string;
  timeZones: string[];
  tlds: string[];
}

const IPInfoResponseSchema = z
  .object({
    ipVersion: z.number().openapi({ example: 4 }),
    ipAddress: z.string().openapi({ example: "162.10.209.81" }),
    latitude: z.number().openapi({ example: 48.859077 }),
    longitude: z.number().openapi({ example: 2.293486 }),
    countryName: z.string().openapi({ example: "France" }),
    countryCode: z.string().openapi({ example: "FR" }),
    timeZone: z.string().openapi({ example: "+01:00" }),
    zipCode: z.string().openapi({ example: "75000" }),
    cityName: z.string().openapi({ example: "Paris" }),
    regionName: z.string().openapi({ example: "Ile-de-France" }),
    continent: z.string().openapi({ example: "Europe" }),
    continentCode: z.string().openapi({ example: "EU" }),
    isProxy: z.boolean().openapi({ example: false }),
    currency: z.object({
      code: z.string().openapi({ example: "EUR" }),
      name: z.string().openapi({ example: "Euro" }),
    }),
    language: z.string().openapi({ example: "French" }),
    timeZones: z.array(z.string().openapi({ example: "Europe/Paris" })),
    tlds: z.array(z.string().openapi({ example: ".fr" })),
  })
  .openapi("IP Info");

async function query(ip: string): Promise<IPInfoResponse> {
  const url = `https://freeipapi.com/api/json/${ip}`;
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
  return (await response.json()) as IPInfoResponse;
}

const ipInfoRoute = createRoute({
  tags: ["IP"],
  method: "get",
  path: "/{ip}",
  request: { params: ParamsSchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: IPInfoResponseSchema,
        },
      },
      description: "Fetch IP info data",
    },
  },
  externalDocs: {
    description: "freeipapi.com",
    url: "https://freeipapi.com/",
  },
});

export const ipInfo = new OpenAPIHono();

ipInfo.openapi(ipInfoRoute, async (c: any) => {
  const { ip } = c.req.valid("param");
  const response = await query(ip);
  return c.json(response);
});
