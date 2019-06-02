import { Provider } from "react-redux";
import App, { Container } from "next/app";
import React from "react";
import withRedux from "next-redux-wrapper";
import { ApolloProvider } from "react-apollo";

import config from "../config";
import { initStore } from "../redux";
import withApolloClient from "../utils/apollo";
import loadScript from "../utils/loadScript";

class DefaultApp extends App {
  static async getInitialProps({ Component, ctx }) {
    return {
      pageProps: {
        ...(Component.getInitialProps
          ? await Component.getInitialProps(ctx)
          : {})
      }
    };
  }

  componentDidMount() {
    loadScript(
      document,
      "script",
      "google-login",
      "https://apis.google.com/js/api.js",
      src => {
        const gapi = window.gapi;
        const params = {
          client_id: config.GOOGLE_CLIENT_ID,
          cookie_policy: "single_host_origin",
          fetch_basic_profile: true,
          ux_mode: "popup",
          redirect_uri: document.location.origin,
          scope: "profile email",
          access_type: "offline"
        };

        gapi.load("auth2", () => {
          if (!gapi.auth2.getAuthInstance()) {
            gapi.auth2
              .init(params)
              .then(res => {
                if (isSignedIn && res.isSignedIn.get()) {
                  // reauth(res.currentUser.get());
                  // this.handleSigninSuccess(res.currentUser.get());
                }
              })
              .catch(err => {
                throw err;
              });
          }
        });
      }
    );
  }

  render() {
    const { Component, pageProps, apolloClient, store } = this.props;
    return (
      <Container>
        <Provider store={store}>
          <ApolloProvider client={apolloClient}>
            <Component {...pageProps} />
          </ApolloProvider>
        </Provider>
      </Container>
    );
  }
}

export default withRedux(initStore)(withApolloClient(DefaultApp));
