import React from "react";
import Link from "next/link";
import { withRouter } from "next/router";

import { connect } from "react-redux";
import actions from "../redux/actions";
import colors from "../colors";

const Header = ({ router: { pathname }, authenticated, logout }) => {
  return (
    <header>
      <Link prefetch href="/">
        <a className={pathname === "/" ? "is-active" : ""}>Home</a>
      </Link>
      <Link prefetch href="/people">
        <a className={pathname.indexOf("/people") === 0 ? "is-active" : ""}>
          People
        </a>
      </Link>
      {authenticated && (
        <a onClick={logout} href="/logout">
          Sign Out
        </a>
      )}
      <style jsx>{`
        header {
          margin-bottom: 1.5rem;
        }
        a {
          font-size: 1.2em;
          margin-right: 15px;
          text-decoration: none;
        }
        .is-active {
          border-bottom: 4px solid ${colors.primary};
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
