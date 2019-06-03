import Router from "next/router";
import gql from "graphql-tag";

import config from "../../config";
import { LOAD_GAPI, LOGIN, LOGOUT } from "../types";
import { setCookie, removeCookie } from "../../utils/cookie";
import { initApollo } from "../../utils/apollo";

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
      }
    }
  }
`;

const loadGoogleAPI = gapi => {
  return dispatch => {
    dispatch({ type: LOAD_GAPI, payload: gapi });
    // const params = {
    //   hosted_domain: config.GOOGLE_DOMAIN,
    //   client_id: config.GOOGLE_CLIENT_ID,
    //   cookie_policy: "single_host_origin",
    //   fetch_basic_profile: true,
    //   ux_mode: "popup",
    //   redirect_uri: "http://localhost:8080",
    //   scope: "profile email",
    //   access_type: "offline"
    // };
    // if (!gapi.auth2.getAuthInstance()) {
    //   gapi.auth2.init(params).then(res => {
    //     dispatch({ type: LOAD_GAPI, payload: gapi });
    //   });
    // }
  };
};

// gets token from the api and stores it in the redux store and in cookie
const login = () => {
  const auth2 = gapi.auth2.getAuthInstance();
  return (dispatch, getState) => {
    const {
      auth: { gapi }
    } = getState();
    auth2
      .grantOfflineAccess({
        hd: config.GOOGLE_DOMAIN
        // redirect_uri: "http://localhost:8080",
        // ux_mode: "popup"
      })
      .then(data => {
        // this gets us the code, which we'll send to the server
        // in order to generate an authorized session
        initApollo()
          .mutate({
            mutation: LOGIN_MUTATION,
            variables: { googleAuthCode: data.code }
          })
          .then(response => {
            const {
              login: { ok, user, token }
            } = response.data;
            if (ok) {
              setCookie("token", token);
              dispatch({ type: LOGIN, payload: token });
              Router.push("/");
            }
          });
      })
      .catch(err => {
        throw err;
      });
  };
};

// gets the token from the cookie and saves it in the store
const reauth = token => {
  return dispatch => {
    dispatch({ type: LOGIN, payload: token });
  };
};

// removing the token
const logout = () => {
  return dispatch => {
    removeCookie("token");
    Router.push("/");
    dispatch({ type: LOGOUT });
  };
};

export default {
  loadGoogleAPI,
  login,
  reauth,
  logout
};
