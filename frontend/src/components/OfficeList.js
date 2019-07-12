import React from "react";
import { Link } from "react-router";
import { Query } from "react-apollo";
import { Flex, Box } from "@rebass/grid/emotion";
import gql from "graphql-tag";
import styled from "@emotion/styled";

import PageLoader from "./PageLoader";

export const LIST_OFFICES_QUERY = gql`
  query listOffices {
    offices {
      id
      name
      location
      lat
      lng
      numPeople
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
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th width={100}>People</th>
                </tr>
              </thead>
              <tbody>
                {offices.map(o => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/offices/${o.id}`}>{o.name}</Link>
                    </td>
                    <td>{o.numPeople.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </OfficeListContainer>
        );
      }}
    </Query>
  );
}
