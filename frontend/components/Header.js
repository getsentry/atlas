import React from "react";
import Link from "next/link";
import { withRouter } from "next/router";

import { connect } from "react-redux";
import actions from "../redux/actions";
import colors from "../colors";
import { ExitToApp } from "@material-ui/icons";

const Navigation = ({ router: { pathname }, authenticated, logout }) => {
  return (
    <section>
      <Link prefetch href="/people">
        <a className={pathname.indexOf("/people") === 0 ? "is-active" : ""}>
          People
        </a>
      </Link>
      {authenticated && (
        <a onClick={logout} href="/logout">
          <ExitToApp />
        </a>
      )}
      <style jsx>{`
        section {
          height: 100%;
          padding: 0 10px;
        }
        a {
          height: 100%;
          font-size: 1.1em;
          display: inline-block;
          padding: 0 10px;
          text-decoration: none;
          align-self: center;
          border: 6px solid #fff;
          border-width: 6px 0;
          color: ${colors.primaryLight};
        }
        .is-active {
          color: ${colors.primary};
          border-bottom: 6px solid ${colors.primaryLight};
        }
      `}</style>
    </section>
  );
};

const Header = props => {
  return (
    <header>
      <h1>
        <Link prefetch href="/">
          <a>Atlas</a>
        </Link>
      </h1>
      <Navigation {...props} />
      <style jsx>{`
        header {
          background: #fff;
          margin: 0 0 1.5rem;
          display: flex;
          line-height: 3em;
          padding: 0 10px;
        }
        h1 {
          padding: 0 10px;
          align-self: center;
          flex-grow: 1;
          color: #ccc;
          letter-spacing: -2px;
          text-transform: uppercase;
        }
        h1 a {
          color: inherit;
        }
      `}</style>
    </header>
  );
};
const mapStateToProps = ({ auth }) => ({
  authenticated: auth.authenticated
});

export default connect(
  mapStateToProps,
  actions
)(withRouter(Header));
