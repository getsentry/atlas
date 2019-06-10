import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import ErrorMessage from "./ErrorMessage";
import PersonLink from "./PersonLink";

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
        if (error) return <ErrorMessage message="Error loading people." />;
        if (loading) return <div>Loading</div>;
        const { users } = data;
        const areMorePeople = false;
        return (
          <section>
            <ul>
              {users.map(p => (
                <li key={p.id}>
                  <PersonLink user={p} />
                </li>
              ))}
            </ul>
            {areMorePeople ? (
              <button onClick={() => loadMorePeople(users, fetchMore)}>
                {" "}
                {loading ? "Loading..." : "Show More"}{" "}
              </button>
            ) : (
              ""
            )}
            <style jsx>{`
              li {
                display: block;
                margin-bottom: 1rem;
              }
              ul {
                margin: 1rem 0;
                padding: 0;
              }
              button:before {
                align-self: center;
                border-style: solid;
                border-width: 6px 4px 0 4px;
                border-color: #ffffff transparent transparent transparent;
                content: "";
                height: 0;
                margin-right: 5px;
                width: 0;
              }
            `}</style>
          </section>
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
