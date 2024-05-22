import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { dnsQuery, nslookup } from "./endpoints/doh";
import { reverseDns } from "./endpoints/reverse-dns";
import { crt } from "./endpoints/crt";
//import whois from "./endpoints/whois";
import { ipInfo } from "./endpoints/ipinfo";

const app = new OpenAPIHono();

/* CORS */
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST"],
  })
);

/* ROOT */
app.get("/", (c) => c.redirect("/swagger"));

/* ROUTES */
app.route("/dns-query", dnsQuery);
app.route("/nslookup", nslookup);
app.route("/reverse-dns", reverseDns);
app.route("/certs", crt);
//app.route("/whois", whois);
app.route("/ipinfo", ipInfo);

/* SWAGGER */
app.get("/swagger", swaggerUI({ url: "/swagger/json" }));

/* JSON */
app.doc("/swagger/json", {
  openapi: "3.0.0",
  info: {
    title: "API",
    version: "0.1.3",
    description: "Cyber [API](https://github.com/cletqui/api)",
    contact: {
      name: "cletqui",
      url: "https://github.com/cletqui/api/issues",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/license/MIT",
    },
  },
  // servers: [{ url: "https://api.cybai.re/", description: "API" }],
  tags: [
    {
      name: "DoH",
      description: "DNS over HTTPs",
      externalDocs: {
        description: "RFC 8484",
        url: "https://www.rfc-editor.org/rfc/rfc8484",
      },
    },
    {
      name: "CRT",
      description: "Certificate Transparency",
      externalDocs: { description: "crt.sh", url: "https://crt.sh/" },
    },
    {
      name: "RDNS",
      description: "Reverse DNS",
      externalDocs: {
        description: "reversedns.io",
        url: "https://reversedns.io/",
      },
    },
    {
      name: "IP",
      description: "IP Info",
      externalDocs: {
        description: "freeipapi.com/",
        url: "https://freeipapi.com/",
      },
    },
  ],
});

export default app;
