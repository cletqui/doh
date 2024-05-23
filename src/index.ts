import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { dnsQuery, nslookup } from "./endpoints/doh";
import { whois } from "./endpoints/whois";
import { crt } from "./endpoints/crt";
import { ipInfo } from "./endpoints/ipinfo";
import { reverseDns } from "./endpoints/reverse-dns";
import { reputationDomain, reputationIP } from "./endpoints/reputation";

const app = new OpenAPIHono();

/* CORS */
app.use("/*", cors({ origin: "*", allowMethods: ["GET", "POST"] }));

/* ROOT */
app.get("/", (c) => c.redirect("/swagger"));

/* ROUTES */
app.route("/dns-query", dnsQuery);
app.route("/nslookup", nslookup);
app.route("/whois", whois);
app.route("/certs", crt);
app.route("/ipinfo", ipInfo);
app.route("/reverse-dns", reverseDns);
app.route("/reputation/domain", reputationDomain);
app.route("/reputation/ip", reputationIP);

/* SWAGGER */
app.get("/swagger", swaggerUI({ url: "/swagger/json" }));

/* JSON */
app.doc("/swagger/json", {
  openapi: "3.0.0",
  info: {
    title: "API",
    version: "0.2.1",
    description:
      "Cyber [API](https://api.cybai.re/) - [GitHub](https://github.com/cletqui/api)",
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
      name: "Domain",
      description: "Domain Info",
    },
    {
      name: "IP",
      description: "IP Info",
    },
  ],
});

export default app;
