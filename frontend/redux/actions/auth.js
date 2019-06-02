import Router from "next/router";

import { LOGIN, LOGOUT } from "../types";
import { setCookie, removeCookie } from "../../utils/cookie";

// gets token from the api and stores it in the redux store and in cookie
const login = (gapi, type) => {
  if (type !== "signin" && type !== "signup") {
    throw new Error("Wrong API call!");
  }
  const auth2 = gapi.auth2.getAuthInstance();
  return dispatch => {
    auth2
      .grantOfflineAccess(options)
      .then(response => {
        setCookie("token", response.data.token);
        Router.push("/");
        dispatch({ type: LOGIN, payload: response.data.token });
      })
      .catch(err => {
        throw new Error(err);
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
  login,
  reauth,
  logout
};
