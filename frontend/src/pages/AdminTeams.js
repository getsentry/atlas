import React from "react";
import { Link } from "react-router";
import { Flex, Box } from "@rebass/grid/emotion";
import { Query } from "react-apollo";

import Card from "../components/Card";
import PageLoader from "../components/PageLoader";
import { LIST_TEAMS_QUERY } from "../queries";

export default () => (
  <section>
    <Card>
      <h1>Teams</h1>
    </Card>
    <Card withPadding>
      <Query
        query={LIST_TEAMS_QUERY}
        variables={{
          limit: 1000
        }}
      >
        {({ loading, error, data }) => {
          if (error) throw error;
          if (loading) return <PageLoader />;
          const { teams } = data;
          return teams.map(d => (
            <div style={{ marginBottom: "0.5rem" }}>
              <Flex>
                <Box flex="1">
                  <Link to={`/admin/teams/${d.id}`}>{d.name}</Link>
                </Box>
                <Box style={{ textAlign: "right" }}>
                  {d.numPeople > 0 && d.numPeople.toLocaleString()}
                </Box>
              </Flex>
            </div>
          ));
        }}
      </Query>
    </Card>
  </section>
);
