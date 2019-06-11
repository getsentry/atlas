// resource for handling cookies taken from here:
// https://github.com/carlos-peru/next-with-api/blob/master/lib/session.js

import cookie from "js-cookie";

export const setCookie = (key, value, options) => {
  if (process.browser) {
    cookie.set(key, value, {
      path: "/",
      ...options
    });
  }
};

export const removeCookie = key => {
  if (process.browser) {
    cookie.remove(key);
  }
};

export const getCookie = (key, req) => {
  return process.browser
    ? getCookieFromBrowser(key)
    : getCookieFromServer(key, req);
};

const getCookieFromBrowser = key => {
  return cookie.get(key);
};

const getCookieFromServer = (key, req) => {
  if (!req.headers.cookie) {
    return undefined;
  }
  const rawCookie = req.headers.cookie
    .split(";")
    .find(c => c.trim().startsWith(`${key}=`));
  if (!rawCookie) {
    return undefined;
  }
  return rawCookie.split("=")[1];
};
