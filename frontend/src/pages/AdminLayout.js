import React from "react";
import { Link } from "react-router";
import { Flex, Box } from "@rebass/grid/emotion";

import Card from "../components/Card";
import Content from "../components/Content";
import Layout from "../components/Layout";

export default ({ children }) => (
  <Layout>
    <Content>
      <Flex mx={-3}>
        <Box width={250} mx={3}>
          <Card>
            <h2>People</h2>
            <ul>
              <li>
                <Link to="/admin/audit">Audit Profiles</Link>
              </li>
              <li>
                <Link to="/admin/update-people">Bulk Update</Link>
              </li>
            </ul>
          </Card>
        </Box>
        <Box flex="1" mx={3}>
          {children}
        </Box>
      </Flex>
    </Content>
  </Layout>
);
