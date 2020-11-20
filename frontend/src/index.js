import React from "react";
import { Router, browserHistory } from "react-router";
import { render } from "react-dom";
import { Provider } from "react-redux";
import * as Sentry from "@sentry/browser";
import { Integrations as TracingIntegrations } from "@sentry/tracing";
import SentryRRWeb from "@sentry/rrweb";
import { ApolloProvider } from "react-apollo";

import routes from "./routes";
import store from "./store";
import * as serviceWorker from "./serviceWorker";
import config from "./config";
import apolloClient from "./utils/apollo";

Sentry.init({
  dsn: config.sentryDsn,
  environment: config.environment,
  release: config.version,
  tracesSampler: (samplingContext) => {
    const name = samplingContext.transactionContext.name;
    if (name.indexOf("/healthz") === 0) {
      return 0;
    }
    return 1.0;
  },
  integrations: [
    new TracingIntegrations.BrowserTracing({
      tracingOrigins: ["localhost", "atlas.getsentry.net", /^\//],
    }),
    new SentryRRWeb(),
  ],
});
Sentry.setTag("role", "frontend");

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

render(
  <ApolloProvider client={apolloClient}>
    <Provider store={store}>
      <Router history={browserHistory} routes={routes} />
    </Provider>
  </ApolloProvider>,
  document.getElementById("root")
);
