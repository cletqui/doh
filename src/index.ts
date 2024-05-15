import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import { dnsQuery, nslookup } from "./endpoints/doh";
//import whois from "./endpoints/whois";
//import ipinfo from "./endpoints/ipinfo";

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
//app.route("/whois", whois);
//app.route("/ipinfo", ipinfo);

/* SWAGGER */
app.get("/swagger", swaggerUI({ url: "/swagger/json" }));

/* JSON */
app.doc("/swagger/json", {
  openapi: "3.0.0",
  info: {
    version: "0.1.2",
    title: "DoH",
  },
});

export default app;
