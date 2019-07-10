import React from "react";
import { Link } from "react-router";
import styled from "@emotion/styled";

import { connect } from "react-redux";
import actions from "../actions";
import colors from "../colors";
import { ExitToApp } from "@material-ui/icons";

import Container from "./Container";

const NavigationContainer = styled.nav`
  height: 100%;
  padding: 0 10px;
  display: flex;
  align-items: center;
  align-self: center;

  a {
    height: 100%;
    font-size: 1.1em;
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
  background: ${colors.indigo};
`;

const HeaderContent = styled.header`
  display: flex;
  line-height: 3em;
  padding: 0 10px;

  h1 {
    padding: 0 10px;
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
      <Container>
        <HeaderContent>
          <h1>
            <Link to="/">Atlas</Link>
          </h1>
          <Navigation {...props} />
        </HeaderContent>
      </Container>
    </HeaderContainer>
  );
};

export default connect(
  ({ auth }) => ({
    authenticated: auth.authenticated
  }),
  { logout: actions.logout }
)(Header);
