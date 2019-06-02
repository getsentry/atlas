import { Query } from "react-apollo";
import gql from "graphql-tag";
import Link from "next/link";

import ErrorMessage from "./ErrorMessage";

export const LIST_PEOPLE_QUERY = gql`
  query listPeople($offset: Int, $limit: Int) {
    users(offset: $offset, limit: $limit) {
      id
      name
    }
  }
`;

export const peopleQueryVars = {
  offset: 0,
  limit: 100
};

export default function PeopleList() {
  return (
    <Query query={LIST_PEOPLE_QUERY} variables={peopleQueryVars}>
      {({ loading, error, data: { users }, fetchMore }) => {
        if (error) return <ErrorMessage message="Error loading people." />;
        if (loading) return <div>Loading</div>;
        const areMorePeople = false;
        return (
          <section>
            PEOPLE
            <ul>
              {users.map((p, index) => (
                <li key={p.id}>
                  <div>
                    <Link
                      href={{ pathname: "/person", query: { id: p.id } }}
                      as={`/people/${p.id}`}
                    >
                      <a>{p.name}</a>
                    </Link>
                  </div>
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
              section {
                padding-bottom: 20px;
              }
              li {
                display: block;
                margin-bottom: 10px;
              }
              div {
                align-items: center;
                display: flex;
              }
              a {
                font-size: 14px;
                margin-right: 10px;
                text-decoration: none;
                padding-bottom: 0;
                border: 0;
              }
              span {
                font-size: 14px;
                margin-right: 5px;
              }
              ul {
                margin: 0;
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
