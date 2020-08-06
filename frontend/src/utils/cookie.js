// resource for handling cookies taken from here:
// https://github.com/carlos-peru/next-with-api/blob/master/lib/session.js

import cookie from "js-cookie";

export const setCookie = (key, value, options) => {
  cookie.set(key, value, {
    path: "/",
    ...options,
  });
};

export const removeCookie = (key) => {
  cookie.remove(key);
};

export const getCookie = (key, req) => {
  return cookie.get(key);
};
