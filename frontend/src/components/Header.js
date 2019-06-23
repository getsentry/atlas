import React from "react";
import { Link } from "react-router";
import styled from "@emotion/styled";

import { connect } from "react-redux";
import actions from "../actions";
import colors from "../colors";
import { ExitToApp } from "@material-ui/icons";

const NavigationContainer = styled.nav`
  height: 100%;
  padding: 0 10px;

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
`;

const Navigation = ({ authenticated, logout }) => {
  return (
    <NavigationContainer>
      <Link to="/people">People</Link>
      {authenticated && (
        <a onClick={logout}>
          <ExitToApp />
        </a>
      )}
    </NavigationContainer>
  );
};

const HeaderContainer = styled.header`
  background: #fff;
  margin: 0 0 1.5rem;
  display: flex;
  line-height: 3em;
  padding: 0 10px;

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
`;

const Header = props => {
  return (
    <HeaderContainer>
      <h1>
        <Link to="/">Atlas</Link>
      </h1>
      <Navigation {...props} />
    </HeaderContainer>
  );
};

export default connect(
  ({ auth }) => ({
    authenticated: auth.authenticated
  }),
  { logout: actions.logout }
)(Header);
