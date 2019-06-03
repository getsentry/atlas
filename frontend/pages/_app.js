import React from "react";
import { Provider } from "react-redux";
import { ApolloProvider } from "react-apollo";
import Router from "next/router";
import App, { Container } from "next/app";
import withRedux from "next-redux-wrapper";

import config from "../config";
import actions from "../redux/actions";
import { initStore } from "../redux";
import withApolloClient from "../utils/apollo";
import loadScript from "../utils/loadScript";
import sentry from "../utils/sentry";
import { getCookie } from "../utils/cookie";

const { Sentry, captureException } = sentry();

class DefaultApp extends App {
  constructor() {
    super(...arguments);
    this.state = {
      hasError: false,
      errorEventId: undefined
    };
  }

  static async getInitialProps({ Component, ctx }) {
    try {
      return {
        pageProps: {
          ...(Component.getInitialProps
            ? await Component.getInitialProps(ctx)
            : {})
        }
      };
    } catch (error) {
      // Capture errors that happen during a page's getInitialProps.
      // This will work on both client and server sides.
      const errorEventId = captureException(error, ctx);
      return {
        hasError: true,
        errorEventId
      };
    }
  }

  static getDerivedStateFromProps(props, state) {
    // If there was an error generated within getInitialProps, and we haven't
    // yet seen an error, we add it to this.state here
    return {
      hasError: props.hasError || state.hasError || false,
      errorEventId: props.errorEventId || state.errorEventId || undefined
    };
  }

  static getDerivedStateFromError() {
    // React Error Boundary here allows us to set state flagging the error (and
    // later render a fallback UI).
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorEventId = captureException(error, { errorInfo });

    // Store the event id at this point as we don't have access to it within
    // `getDerivedStateFromError`.
    this.setState({ errorEventId });
  }

  componentDidMount() {
    loadScript(
      document,
      "script",
      "google-login",
      "https://apis.google.com/js/api.js",
      src => {
        const gapi = window.gapi;
        gapi.load("auth2", () => {
          actions.loadGoogleAPI(gapi)(this.props.store.dispatch);

          const params = {
            hosted_domain: config.GOOGLE_DOMAIN,
            client_id: config.GOOGLE_CLIENT_ID,
            cookie_policy: "single_host_origin",
            fetch_basic_profile: true,
            ux_mode: "popup",
            redirect_uri: "http://localhost:8080",
            scope: "profile email",
            access_type: "offline"
          };
          if (!gapi.auth2.getAuthInstance()) {
            gapi.auth2
              .init(params)
              .then(res => {
                const curToken = getCookie("token");
                if (curToken && res.isSignedIn && res.isSignedIn.get()) {
                  // res.currentUser.get().getAuthResponse().id_token
                  actions.reauth(curToken)(this.props.store.dispatch);
                } else {
                  actions.logout();
                  Router.push("/login");
                }
              })
              .catch(err => {
                actions.logout();
                Router.push("/login");
                throw err;
              });
          }
        });
      }
    );
  }

  render() {
    if (this.state.error) {
      return (
        <section>
          <h1>There was an error!</h1>
          <p>
            <a
              href="#"
              onClick={() =>
                Sentry.showReportDialog({ eventId: this.state.errorEventId })
              }
            >
              📣 Report this error
            </a>
          </p>
          <p>
            <a
              href="#"
              onClick={() => {
                window.location.reload(true);
              }}
            >
              Or, try reloading the page
            </a>
          </p>
        </section>
      );
    }
    const { Component, pageProps, apolloClient, store } = this.props;
    return (
      <Container>
        <Provider store={store}>
          <ApolloProvider store={store} client={apolloClient}>
            <Component {...pageProps} />
          </ApolloProvider>
        </Provider>
      </Container>
    );
  }
}

// order matters here - withRedux needs to be on inner most child
export default withApolloClient(withRedux(initStore)(DefaultApp));
