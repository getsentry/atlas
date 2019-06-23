import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import styled from "@emotion/styled";

import PageLoader from "./PageLoader";

export const LIST_OFFICES_QUERY = gql`
  query listOffices {
    offices {
      id
      name
    }
  }
`;

const OfficeListContainer = styled.section`
  li {
    display: block;
    margin-bottom: 1rem;
  }
  ul {
    margin: 1rem 0;
    padding: 0;
  }
`;

export default function OfficeList() {
  return (
    <Query query={LIST_OFFICES_QUERY}>
      {({ loading, error, data }) => {
        if (error) throw error;
        if (loading) return <PageLoader />;
        const { offices } = data;
        return (
          <OfficeListContainer>
            <ul>
              {offices.map(o => (
                <li key={o.id}>{o.name}</li>
              ))}
            </ul>
          </OfficeListContainer>
        );
      }}
    </Query>
  );
}
