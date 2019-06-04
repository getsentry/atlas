import { Query } from "react-apollo";
import gql from "graphql-tag";

import ErrorMessage from "./ErrorMessage";

export const LIST_OFFICES_QUERY = gql`
  query listOffices {
    offices {
      id
      name
    }
  }
`;

export default function OfficeList() {
  return (
    <Query query={LIST_OFFICES_QUERY}>
      {({ loading, error, data }) => {
        if (error) return <ErrorMessage message="Error loading offices." />;
        if (loading) return <div>Loading</div>;
        const { offices } = data;
        return (
          <section>
            <ul>
              {offices.map(o => (
                <li key={o.id}>{o.name}</li>
              ))}
            </ul>
            <style jsx>{`
              li {
                display: block;
                margin-bottom: 1rem;
              }
              ul {
                margin: 1rem 0;
                padding: 0;
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
