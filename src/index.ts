import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import dnsQuery from "./endpoints/dns-query";

const app = new OpenAPIHono();

/* CORS */
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST"],
  })
);

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
