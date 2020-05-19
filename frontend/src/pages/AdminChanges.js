import React from "react";
import { Link } from "react-router";
import { Flex, Box } from "@rebass/grid/emotion";
import { Query } from "react-apollo";

import Card from "../components/Card";
import PageLoader from "../components/PageLoader";
import { LIST_CHANGES_QUERY } from "../queries";

export default () => (
  <section>
    <Card>
      <h1>Changes</h1>
    </Card>
    <Card withPadding>
      <Query
        query={LIST_CHANGES_QUERY}
        variables={{
          limit: 1000
        }}
      >
        {({ loading, error, data }) => {
          if (error) throw error;
          if (loading) return <PageLoader />;
          const { changes } = data;
          return changes.map(c => (
            <div style={{ marginBottom: "0.5rem" }}>
              <Flex>
                <Box flex="1">
                  <Link to={`/admin/changes/${c.id}`}>
                    {c.objectType} {c.objectId}
                  </Link>
                  <div>
                    <small>{c.changes}</small>
                  </div>
                </Box>
                <Box style={{ width: 50 }}>{c.version}</Box>
                <Box style={{ width: 200 }}>{c.user && c.user.email}</Box>
                <Box style={{ textAlign: "right" }}>{c.timestamp}</Box>
              </Flex>
            </div>
          ));
        }}
      </Query>
    </Card>
  </section>
);
