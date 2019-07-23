import React from "react";
import { Link } from "react-router";
import styled from "@emotion/styled";
import { Flex, Box } from "@rebass/grid/emotion";
import { connect } from "react-redux";

import actions from "../actions";
import colors from "../colors";
import Avatar from "./Avatar";

const NavigationContainer = styled.nav`
  height: 100%;
  display: flex;
  align-items: center;
  align-self: center;

  a {
    display: inline-block;
    padding: 0 10px;
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    color: ${colors.gray200};
  }
  a:hover {
    color: ${colors.white};
  }
  .is-active {
    color: ${colors.white};
  }
  .profile {
    font-size: 0.9em;
    border-radius: 50rem;
    background: rgba(31, 45, 61, 0.15);
    padding: 2px 1rem 2px 2px;
    position: relative;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
  }
  .profile:hover {
    background: rgba(31, 45, 61, 0.35);
  }
`;

const Navigation = ({ authenticated, logout, user }) => {
  return (
    <NavigationContainer>
      <Flex style={{ height: "100%" }} width={1} alignItems="center">
        <Box pr={2} flex="1">
          <Link to="/people">People</Link>
          <Link to="/offices">Offices</Link>
        </Box>
        <Box pl={2}>
          {authenticated && (
            <Link to={`/people/${user.email}`} className="profile">
              <Avatar user={user} size={36} mr />
              {user.name}
            </Link>
          )}
        </Box>
      </Flex>
    </NavigationContainer>
  );
};

const HeaderContainer = styled.header`
  background: ${colors.background};
  border-bottom: 1px solid hsla(0, 0%, 100%, 0.1) !important;
  margin: 0 0.75rem 1.5rem;
  height: 5rem;

  h1 {
    margin: 0;
    color: ${colors.foreground};
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
      <Flex alignItems="center" style={{ height: "100%" }}>
        <Box width={300} px={3}>
          <h1>
            <Link to="/">Atlas</Link>
          </h1>
        </Box>
        <Box px={3} flex="1">
          <Navigation {...props} />
        </Box>
      </Flex>
    </HeaderContainer>
  );
};

export default connect(
  ({ auth }) => ({
    authenticated: auth.authenticated,
    user: auth.user
  }),
  { logout: actions.logout }
)(Header);
