import React from "react";
import { Flex, Box } from "@rebass/grid/emotion";
import { Query } from "react-apollo";

import Card from "../components/Card";
import PersonLink from "../components/PersonLink";
import PageLoader from "../components/PageLoader";
import { LIST_PEOPLE_QUERY } from "../queries";

export default () => (
  <section>
    <Card>
      <h1>Attention Required</h1>
    </Card>
    <Card>
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
            .filter(u => {
              const employeeTypeId = u.employeeType ? u.employeeType.id : null;
              return (
                (u.isHuman &&
                  (employeeTypeId === "FULL_TIME" || employeeTypeId === "INTERN") &&
                  (!u.title || !u.department || !u.dateStarted)) ||
                (!u.isHuman && (u.reportsTo || u.title || u.department)) ||
                (u.isHuman &&
                  employeeTypeId === "FULL_TIME" &&
                  u.title !== "CEO" &&
                  u.title !== "Chief Executive Officer" &&
                  !u.reportsTo)
              );
            })
            .map(u => (
              <div style={{ marginBottom: "0.5rem" }}>
                <Flex>
                  <Box flex="1">
                    <PersonLink user={u} />
                  </Box>
                  <Box>
                    {u.isHuman && !u.title && <div>Missing title</div>}
                    {u.isHuman && !u.department && <div>Missing department</div>}
                    {u.isHuman && !u.dateStarted && <div>Missing dateStarted</div>}
                    {u.isHuman &&
                      u.employeeType &&
                      u.employeeType.id === "FULL_TIME" &&
                      u.title !== "CEO" &&
                      u.title !== "Chief Executive Officer" &&
                      !u.reportsTo && <div>Missing reportsTo</div>}
                    {!u.isHuman && <div>Probably a human</div>}
                  </Box>
                </Flex>
              </div>
            ));
        }}
      </Query>
    </Card>
  </section>
);
