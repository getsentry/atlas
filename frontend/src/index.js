import React from "react";
import { Router, browserHistory } from "react-router";
import { render } from "react-dom";
import { Provider } from "react-redux";
import * as rrweb from "rrweb";
import * as Sentry from "@sentry/browser";
import { Tracing } from "@sentry/integrations";
import { ApolloProvider } from "react-apollo";

import routes from "./routes";
import store from "./store";
import * as serviceWorker from "./serviceWorker";
import config from "./config";
import apolloClient from "./utils/apollo";

const rrwebEvents = [];

rrweb.record({
  emit(event) {
    rrwebEvents.push(event);
  }
});

class rrwebIntegration {
  constructor() {
    this.name = "rrwebIntegration";
  }

  attachmentUrlFromDsn(dsn, eventId) {
    const { host, path, projectId, port, protocol, user } = dsn;
    return `${protocol}://${host}${port !== "" ? `:${port}` : ""}${
      path !== "" ? `/${path}` : ""
    }/api/${projectId}/events/${eventId}/attachments/?sentry_key=${user}&sentry_version=7&sentry_client=rrweb`;
  }

  setupOnce() {
    Sentry.addGlobalEventProcessor(event => {
      try {
        // short circuit if theres no events to replay
        // if (!rrwebEvents.length) return;
        // const self = Sentry.getCurrentHub().getIntegration(rrwebIntegration);
        const client = Sentry.getCurrentHub().getClient();
        const endpoint = this.attachmentUrlFromDsn(client.getDsn(), event.event_id);
        const formData = new FormData();
        formData.append(
          "rrweb",
          new Blob([JSON.stringify({ events: rrwebEvents })], {
            type: "application/json"
          }),
          "rrweb.json"
        );
        fetch(endpoint, {
          method: "POST",
          body: formData
        }).catch(ex => {
          // we have to catch this otherwise it throws an infinite loop in Sentry
          console.error(ex);
        });
        return event;
      } catch (ex) {
        console.error(ex);
      }
    });
  }
}

Sentry.init({
  dsn: config.sentryDsn,
  environment: config.environment,
  release: config.version,
  integrations: [
    new Tracing({
      tracingOrigins: ["localhost", "atlas.getsentry.net", /^\//]
    }),
    new rrwebIntegration()
  ]
});

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
