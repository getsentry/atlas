import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import PageLoader from "./PageLoader";
import PersonList from "./PersonList";

export const LIST_PEOPLE_QUERY = gql`
  query listPeople(
    $office: UUID
    $dateStartedAfter: Date
    $query: String
    $includeSelf: Boolean
    $orderBy: UserOrderBy
    $offset: Int
    $limit: Int
  ) {
    users(
      office: $office
      dateStartedAfter: $dateStartedAfter
      query: $query
      includeSelf: $includeSelf
      orderBy: $orderBy
      offset: $offset
      limit: $limit
    ) {
      id
      name
      profile {
        title
        photoUrl
        reportsTo {
          id
        }
      }
    }
  }
`;

export const peopleQueryVars = {
  offset: 0,
  limit: 100,
  orderBy: "name"
};

export default function PeopleList() {
  return (
    <Query query={LIST_PEOPLE_QUERY} variables={peopleQueryVars}>
      {({ loading, error, data, fetchMore }) => {
        if (error) throw error;
        if (loading) return <PageLoader />;
        const { users } = data;
        const areMorePeople = false;
        return (
          <React.Fragment>
            <PersonList people={users} />
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
