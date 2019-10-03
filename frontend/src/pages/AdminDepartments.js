import React from "react";
import { Flex, Box } from "@rebass/grid/emotion";
import { Query } from "react-apollo";

import Card from "../components/Card";
import PageLoader from "../components/PageLoader";
import { LIST_DEPARTMENTS_QUERY } from "../queries";

export default () => (
  <section>
    <Card>
      <h1>Departments</h1>
    </Card>
    <Card withPadding>
      <Query
        query={LIST_DEPARTMENTS_QUERY}
        variables={{
          limit: 1000
        }}
      >
        {({ loading, error, data }) => {
          if (error) throw error;
          if (loading) return <PageLoader />;
          const { departments } = data;
          return departments.map(d => (
            <Flex>
              <Box flex="1">
                <strong>{d.name}</strong>
                <br />
                <small>{d.id}</small>
              </Box>
            </Flex>
          ));
        }}
      </Query>
    </Card>
  </section>
);
