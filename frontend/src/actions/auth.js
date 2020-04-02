import gql from "graphql-tag";

import config from "../config";
import { LOAD_GAPI, LOGIN, LOGOUT } from "../types";
import { getCookie, setCookie, removeCookie } from "../utils/cookie";
import apolloClient from "../utils/apollo";
import loadScript from "../utils/loadScript";

export const LOGIN_MUTATION = gql`
  mutation login($googleAuthCode: String!) {
    login(googleAuthCode: $googleAuthCode) {
      ok
      errors
      token
      user {
        id
        email
        name
        isSuperuser
        hasOnboarded
        photo {
          data
          width
          height
          mimeType
        }
      }
    }
  }
`;

export const CURRENT_USER_QUERY = gql`
  query getCurrentUser {
    me {
      id
      name
      email
      isSuperuser
      hasOnboarded
      photo {
        data
        width
        height
        mimeType
      }
    }
  }
`;

const loadSession = () => {
  return dispatch => {
    return loadScript(
      document,
      "script",
      "google-login",
      "https://apis.google.com/js/api.js"
    ).then(() => {
      const gapi = window.gapi;
      console.info("[auth] Loading auth2 from apis.google.com");
      gapi.load("auth2", () => {
        const params = {
          hosted_domain: config.googleDomain,
          client_id: config.googleClientId,
          cookie_policy: "single_host_origin",
          fetch_basic_profile: true,
          ux_mode: "popup",
          redirect_uri: config.googleRedirectUri,
          scope: config.googleScopes,
          access_type: "offline"
        };
        if (!gapi.auth2.getAuthInstance()) {
          console.info("[auth] Initializing session");
          gapi.auth2
            .init(params)
            .then(res => {
              dispatch({
                type: LOAD_GAPI,
                payload: gapi.auth2.getAuthInstance()
              });
              const curToken = getCookie("token");
              if (curToken && res.isSignedIn && res.isSignedIn.get()) {
                return dispatch(reauth(curToken));
              } else {
                return dispatch(logout());
              }
            })
            .catch(err => {
              dispatch(logout());
              throw err;
            });
        } else {
          console.info("[auth] Session already initialized");
          dispatch({
            type: LOAD_GAPI,
            payload: gapi.auth2.getAuthInstance()
          });
        }
      });
    });
  };
};

// gets token from the api and stores it in the redux store and in cookie
const login = () => {
  return (dispatch, getState) => {
    const {
      auth: { googleAuthInstance }
    } = getState();
    // API hasnt been loaded, so force it now
    if (!googleAuthInstance) {
      return dispatch(loadSession()).then(() => {
        return dispatch(login());
      });
    }
    console.info("[auth] Authentication with Google");
    googleAuthInstance
      .grantOfflineAccess({
        hd: config.googleDomain
        // redirect_uri: "http://localhost:8080",
        // ux_mode: "popup"
      })
      .then(data => {
        // this gets us the code, which we'll send to the server
        // in order to generate an authorized session
        console.info("[auth] Verifying authentication with Atlas");
        apolloClient
          .mutate({
            mutation: LOGIN_MUTATION,
            variables: { googleAuthCode: data.code }
          })
          .then(response => {
            const {
              login: { ok, token, user }
            } = response.data;
            if (ok) {
              console.info(`[auth] Successfully authenticated as ${user.email}`);
              setCookie("token", token);
              return dispatch({
                type: LOGIN,
                payload: {
                  token,
                  user
                }
              });
            } else {
              console.info(`[auth] Authentication failed: unknown reason`);
              throw new Error("Unable to authenticate");
            }
          })
          .catch(err => {
            console.error(`[auth] Authentication failed: ${err}`);
            throw err;
          });
      })
      .catch(err => {
        console.error(`[auth] Authentication failed: ${err}`);
        throw err;
      });
  };
};

// gets the token from the cookie and saves it in the store
const reauth = token => {
  return (dispatch, getState) => {
    apolloClient
      .query({
        query: CURRENT_USER_QUERY
      })
      .then(response => {
        const { me } = response.data;
        if (me) {
          console.info(`[auth] Successfully authenticated as ${me.email}`);
          return dispatch({
            type: LOGIN,
            payload: {
              token,
              user: me
            }
          });
        } else {
          return dispatch(logout());
        }
      })
      .catch(err => {
        console.error(`[auth] Authentication failed: ${err}`);
        throw err;
      });
  };
};

// removing the token
const logout = () => {
  return dispatch => {
    if (getCookie("token")) {
      console.info(`[auth] Logging out`);
      removeCookie("token");
    }
    return dispatch({ type: LOGOUT });
  };
};

export default {
  loadSession,
  login,
  reauth,
  logout
};
