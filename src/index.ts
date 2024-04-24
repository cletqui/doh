import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import users from "./endpoints/users";
import whois from "./endpoints/whois";
import ipinfo from "./endpoints/ipinfo";
import nslookup from "./endpoints/nslookup";

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
// app.route("/users", users);
app.route("/whois", whois);
app.route("/ipinfo", ipinfo);
app.route("/nslookup", nslookup);

/* SWAGGER */
app.get("/doc", swaggerUI({ url: "/doc/json" }));

/* JSON */
app.doc("/doc/json", {
  openapi: "3.0.0",
  info: {
    version: "0.0.1",
    title: "API",
  },
});

export default app;
