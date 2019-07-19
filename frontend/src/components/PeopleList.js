import React from "react";
import { Flex, Box } from "@rebass/grid/emotion";
import { Query } from "react-apollo";

import PageLoader from "./PageLoader";
import PersonCard from "./PersonCard";
import { LIST_PEOPLE_QUERY } from "../queries";

export const peopleQueryVars = {
  offset: 0,
  limit: 100,
  orderBy: "name"
};

export default function PeopleList({ query }) {
  return (
    <Query query={LIST_PEOPLE_QUERY} variables={{ peopleQueryVars, ...query }}>
      {({ loading, error, data, fetchMore }) => {
        if (error) throw error;
        if (loading) return <PageLoader />;
        const { users } = data;
        const areMorePeople = false;
        return (
          <React.Fragment>
            <Flex flexWrap="wrap" mx={-2}>
              {users.map(u => (
                <Box px={1} mx="auto" width={196}>
                  <PersonCard user={u} key={u.id} />
                </Box>
              ))}
            </Flex>
            {areMorePeople ? (
              <button onClick={() => loadMorePeople(users, fetchMore)}>
                {" "}
                {loading ? "Loading..." : "Show More"}{" "}
              </button>
            ) : (
              ""
            )}
          </React.Fragment>
        );
      }}
    </Query>
  );
}

function loadMorePeople(users, fetchMore) {
  fetchMore({
    variables: {
      ...peopleQueryVars,
      offset: users.length
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      if (!fetchMoreResult) {
        return previousResult;
      }
      return Object.assign({}, previousResult, {
        // Append the new results to the old one
        users: [...previousResult.users, ...fetchMoreResult.users]
      });
    }
  });
}
