import React, { Component } from "react";
import Router from "next/router";
import nextCookie from "next-cookies";

import { removeCookie, setCookie } from "./cookie";

export const login = async ({ token }) => {
  setCookie("token", token, { expires: 1 });
  // localStorage.setItem('token', token)
  Router.push("/");
};

export const signup = async ({ token }) => {
  setCookie("token", token, { expires: 1 });
  // localStorage.setItem('token', token)
  Router.push("/");
};

export const logout = () => {
  removeCookie("token");
  // to support logging out from all windows
  window.localStorage.setItem("logout", Date.now());
  // window.localStorage.removeItem('token')
  Router.push("/login");
};

// Gets the display name of a JSX component for dev tools
const getDisplayName = Component =>
  Component.displayName || Component.name || "Component";

export const auth = ctx => {
  const { token } = nextCookie(ctx);

  /*
   * This happens on server only, ctx.req is available means it's being
   * rendered on server. If we are on server and token is not available,
   * means user is not logged in.
   */
  if (ctx.req && !token) {
    ctx.res.writeHead(302, { Location: "/login" });
    ctx.res.end();
    return;
  }

  // We already checked for server. This should only happen on client.
  if (!token) {
    Router.push("/login");
  }

  return token;
};

export const withAuth = WrappedComponent => {
  return class Auth extends Component {
    static displayName = `withAuth(${getDisplayName(WrappedComponent)})`;
    static async getInitialProps(ctx) {
      const token = auth(ctx);

      const componentProps =
        WrappedComponent.getInitialProps &&
        (await WrappedComponent.getInitialProps(ctx));

      return { ...componentProps, token };
    }

    componentDidMount() {
      window.addEventListener("storage", this.syncLogout);
    }

    componentWillUnmount() {
      window.removeEventListener("storage", this.syncLogout);
      window.localStorage.removeItem("logout");
    }

    syncLogout = event => {
      if (event.key === "logout") {
        console.log("logged out from storage!");
        Router.push("/login");
      }
    };

    render() {
      console.log("what");
      return <WrappedComponent {...this.props} />;
    }
  };
};
