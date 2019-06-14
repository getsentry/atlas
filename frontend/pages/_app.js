import React from "react";
import { Provider } from "react-redux";
import { ApolloProvider } from "react-apollo";
import App, { Container } from "next/app";
import withRedux from "next-redux-wrapper";

import colors from "../colors";
import { initStore } from "../redux";
import withApolloClient from "../utils/apollo";
import initSentry from "../utils/sentry";
import GlobalLoader from "../components/GlobalLoader";

const Sentry = initSentry();

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
      error.ctx = ctx;
      const errorEventId = Sentry.captureException(error);
      return {
        hasError: true,
        errorEventId
      };
    }
  }

  static getDerivedStateFromProps(props, state) {
    return {
      // If there was an error generated within getInitialProps, and we haven't
      // yet seen an error, we add it to this.state here
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
    error.ctx = { errorInfo };
    const errorEventId = Sentry.captureException(error);

    // Store the event id at this point as we don't have access to it within
    // `getDerivedStateFromError`.
    this.setState({ errorEventId });
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
        <GlobalLoader color={colors.primary} />
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
