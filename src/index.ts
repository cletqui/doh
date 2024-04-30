import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import dnsQuery from "./endpoints/dns-query";

const app = new OpenAPIHono();

/* ROUTES */
app.route("/dns-query", dnsQuery);

/* SWAGGER */
app.get("/", swaggerUI({ url: "/json" }));

/* JSON */
app.doc("/json", {
  openapi: "3.0.0",
  info: {
    version: "0.1.1",
    title: "DoH",
  },
});

export default app;
