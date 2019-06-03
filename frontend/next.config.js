const webpack = require("webpack");
const withSourceMaps = require("@zeit/next-source-maps");

module.exports = withSourceMaps({
  env: {
    SENTRY_DSN: process.env.SENTRY_DSN,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
  },
  target: "serverless",
  webpack: (config, { isServer, buildId }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        "process.env.SENTRY_RELEASE": JSON.stringify(buildId)
      })
    );

    if (!isServer) {
      config.resolve.alias["@sentry/node"] = "@sentry/browser";
    }

    return config;
  }
});
