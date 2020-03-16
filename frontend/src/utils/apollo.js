import { ApolloClient, InMemoryCache } from "apollo-boost";
import { ApolloLink, concat } from "apollo-link";
import { createUploadLink } from "apollo-upload-client";

import config from "../config";
import { getCookie } from "./cookie";

let apolloClient = null;

const defaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore"
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all"
  }
};

const getToken = () => {
  let token = null;
  if (typeof document !== "undefined") {
    token = "Token " + getCookie("token");
  }
  return token;
};

function create(initialState) {
  const authMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext({
      headers: {
        authorization: getToken()
      }
    });

    return forward(operation);
  });

  const httpLink = createUploadLink({
    uri: config.apiEndpoint, // Server URL (must be absolute)
    credentials: "same-origin" // Additional fetch() options like `credentials` or `headers`
  });

  return new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache: new InMemoryCache().restore(initialState || {}),
    defaultOptions
  });
}

export function initApollo(initialState) {
  if (!apolloClient) {
    apolloClient = create(initialState);
  }

  return apolloClient;
}

export default initApollo();
