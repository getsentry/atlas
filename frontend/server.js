const express = require("express");
const next = require("next");

const PORT = parseInt(process.env.PORT, 10) || 3000;
const DEV = process.env.NODE_ENV !== "production";

const app = next({ dev: DEV });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // The app.buildId is only available after app.prepare(), hence why we setup
  // here.
  const Sentry = require("./utils/sentry")(app.buildId);
  const server = express();

  server.use(Sentry.Handlers.requestHandler());

  server.get("/people/:id", (req, res) => {
    return app.render(req, res, "/person", { ...req.params, ...req.query });
  });

  server.get("/people/:id/update", (req, res) => {
    return app.render(req, res, "/updatePerson", {
      ...req.params,
      ...req.query
    });
  });

  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.use(Sentry.Handlers.errorHandler());

  server.listen(PORT, err => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
