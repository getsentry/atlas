import React from "react";
import { Link } from "react-router";
import styled from "@emotion/styled";

import { connect } from "react-redux";
import actions from "../actions";
import colors from "../colors";
import { ExitToApp } from "@material-ui/icons";

import LeftFrame from "./LeftFrame";

const NavigationContainer = styled.nav`
  height: 100%;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  align-self: center;

  a {
    font-size: 1em;
    display: inline-block;
    padding: 0 10px;
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    color: ${colors.gray200};
  }

  .is-active {
    color: ${colors.white};
  }
`;

const Navigation = ({ authenticated, logout }) => {
  return (
    <NavigationContainer>
      <Link to="/people">People</Link>
      {authenticated && (
        <a href onClick={logout}>
          <ExitToApp />
        </a>
      )}
    </NavigationContainer>
  );
};

const HeaderContainer = styled.header`
  background: ${colors.primary};
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.1) !important;
  margin: 0 0.5rem 1.5rem;
`;

const HeaderContent = styled.header`
  display: flex;
  height: 3rem;
  padding: 0 1rem;
  align-items: center;

  h1 {
    padding: 0 10px;
    margin: 0;
    align-self: center;
    flex-grow: 1;
    color: ${colors.white};
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
      <HeaderContent>
        <LeftFrame>
          <h1>
            <Link to="/">Atlas</Link>
          </h1>
        </LeftFrame>
        <Navigation {...props} />
      </HeaderContent>
    </HeaderContainer>
  );
};

export default connect(
  ({ auth }) => ({
    authenticated: auth.authenticated
  }),
  { logout: actions.logout }
)(Header);
