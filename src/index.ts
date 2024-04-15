import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import users from "./endpoints/users";
import ip from "./endpoints/ip";
import dns from "./endpoints/dns";

const app = new OpenAPIHono();

/* ROUTES */
app.route("/users", users);
app.route("/ip", ip);
app.route("/dns", dns);

/* SWAGGER */
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "0.0.1",
    title: "API",
  },
});

/* ROOT */
app.get("/", swaggerUI({ url: "/doc" }));

export default app;
