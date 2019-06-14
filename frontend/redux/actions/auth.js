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
        isSuperuser
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
  return (dispatch, getState) => {
    const {
      auth: { gapi }
    } = getState();
    const auth2 = gapi.auth2.getAuthInstance();
    auth2
      .grantOfflineAccess({
        hd: config.googleDomain
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
              login: { ok, token, user }
            } = response.data;
            if (ok) {
              setCookie("token", token);
              dispatch({
                type: LOGIN,
                payload: {
                  token,
                  user
                }
              });
              // TODO(dcramer): this doesnt belong here
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
    initApollo()
      .query({
        query: CURRENT_USER_QUERY
      })
      .then(response => {
        const { me } = response.data;
        if (me) {
          dispatch({
            type: LOGIN,
            payload: {
              token,
              user: me
            }
          });
        } else {
          logout()(dispatch);
        }
      })
      .catch(err => {
        throw err;
      });
  };
};

// removing the token
const logout = () => {
  return dispatch => {
    removeCookie("token");
    dispatch({ type: LOGOUT });
  };
};

export default {
  loadGoogleAPI,
  login,
  reauth,
  logout
};
