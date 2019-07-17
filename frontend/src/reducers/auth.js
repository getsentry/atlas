import { LOAD_GAPI, LOGIN, LOGOUT } from "../types";

import * as Sentry from "@sentry/browser";

const initialState = {
  authenticated: null,
  user: null,
  token: null,
  googleAuthInstance: null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOAD_GAPI:
      return {
        ...state,
        googleAuthInstance: action.payload
      };
    case LOGIN:
      Sentry.setUser({
        id: action.payload.user.id,
        email: action.payload.user.email
      });

      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        authenticated: true
      };
    case LOGOUT:
      Sentry.setUser({});

      return {
        ...state,
        token: null,
        authenticated: false,
        user: null
      };
    default:
      return state;
  }
};
