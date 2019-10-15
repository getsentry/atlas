import React from "react";
import { Link } from "react-router";
import { Flex, Box } from "@rebass/grid/emotion";
import styled from "@emotion/styled";

import colors from "../colors";
import Card from "../components/Card";
import Content from "../components/Content";
import Layout from "../components/Layout";

const activeClassName = "nav-item-active";

const NavigationLink = styled(Link)`
  margin-left: -0.25rem;
  margin-right: -0.25rem;
  padding: 0.25rem;
  border-radius: 0.25rem;
  display: block;

  &:hover {
    color: ${colors.white};
  }

  &.${activeClassName} {
    color: ${colors.white};
    background: ${colors.black};
  }
`;

NavigationLink.defaultProps = { activeClassName };

export default ({ children }) => (
  <Layout>
    <Content>
      <Flex mx={-3}>
        <Box width={250} mx={3}>
          <Card withPadding>
            <h2>People</h2>
            <NavigationLink to="/admin/people/audit">Audit Profiles</NavigationLink>
            <NavigationLink to="/admin/people/bulk-update">Bulk Update</NavigationLink>
            <NavigationLink to="/admin/people/import-export">
              Import/Export
            </NavigationLink>
          </Card>
          <Card withPadding>
            <h2>Departments</h2>
            <NavigationLink to="/admin/departments">All Departments</NavigationLink>
            <NavigationLink to="/admin/departments/create">
              Create Department
            </NavigationLink>
          </Card>
        </Box>
        <Box flex="1" mx={3}>
          {children}
        </Box>
      </Flex>
    </Content>
  </Layout>
);
