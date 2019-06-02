const express = require("express");
const proxy = require("http-proxy-middleware");

const PORT = parseInt(process.env.PORT, 10) || 8080;

const app = express();

const routes = [
  {
    route: "/graphql/",
    address: "http://localhost:8000"
  },
  {
    route: "/",
    address: "http://localhost:3000"
  }
];

for (route of routes) {
  app.use(
    route.route,
    proxy({
      target: route.address
    })
  );
}

app.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
});
