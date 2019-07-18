import React from "react";
import { Flex, Box } from "@rebass/grid/emotion";
import { Query } from "react-apollo";

import Card from "../components/Card";
import Content from "../components/Content";
import Layout from "../components/Layout";
import PersonLink from "../components/PersonLink";
import PageLoader from "../components/PageLoader";
import { LIST_PEOPLE_QUERY } from "../queries";

export default () => (
  <Layout>
    <Content>
      <Card>
        <h1>Attention Required</h1>
        <Query
          query={LIST_PEOPLE_QUERY}
          variables={{
            humansOnly: false,
            limit: 1000
          }}
        >
          {({ loading, error, data }) => {
            if (error) throw error;
            if (loading) return <PageLoader />;
            const { users } = data;
            return users
              .filter(
                u =>
                  (u.isHuman && (!u.title || !u.department || !u.dateStarted)) ||
                  (!u.isHuman && (u.reportsTo || u.title || u.department))
              )
              .map(u => (
                <Flex>
                  <Box flex="1">
                    <PersonLink user={u} />
                  </Box>
                  <Box>
                    {u.isHuman && !u.title && <div>Missing title</div>}
                    {u.isHuman && !u.department && <div>Missing department</div>}
                    {u.isHuman && !u.dateStarted && <div>Missing dateStarted</div>}
                    {!u.isHuman && <div>Probably a human</div>}
                  </Box>
                </Flex>
              ));
          }}
        </Query>
      </Card>
    </Content>
  </Layout>
);
