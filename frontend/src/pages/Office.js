import React, { Component } from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import styled from "@emotion/styled";
import { Flex, Box } from "@rebass/grid/emotion";
import { Settings } from "@material-ui/icons";

import colors from "../colors";
import Card from "../components/Card";
import Content from "../components/Content";
import ErrorMessage from "../components/ErrorMessage";
import Layout from "../components/Layout";
import IconLink from "../components/IconLink";
import OfficeMap from "../components/OfficeMap";

export const OFFICE_QUERY = gql`
  query getOffice($id: UUID!) {
    offices(id: $id) {
      id
      name
      location
      lat
      lng
    }
  }
`;

const OfficeHeader = styled.div`
  color: ${colors.white};
  margin-bottom: 1.5rem;
`;

export default class extends Component {
  render() {
    return (
      <Layout>
        <Query query={OFFICE_QUERY} variables={{ id: this.props.params.id }}>
          {({ loading, error, data }) => {
            if (error) return <ErrorMessage message="Error loading person." />;
            if (loading) return <div>Loading</div>;
            if (!data.offices.length)
              return <ErrorMessage message="Couldn't find that person." />;
            const thisOffice = data.offices[0];
            return (
              <Content>
                <OfficeHeader>
                  <Flex alignItems="center">
                    <Box px={3} flex="1">
                      <h1>{thisOffice.name}</h1>
                    </Box>
                    <Box px={3}>
                      <IconLink
                        icon={<Settings />}
                        to={`/offices/${this.props.params.id}/update`}
                        style={{ fontSize: "0.9em" }}
                      >
                        Edit
                      </IconLink>
                    </Box>
                  </Flex>
                </OfficeHeader>
                <Flex alignItems="center">
                  <Box px={3} flex="1">
                    <Card>
                      {thisOffice.location && <p>{thisOffice.location}</p>}
                      <OfficeMap
                        office={thisOffice}
                        width="100%"
                        height={400}
                        zoom={12}
                      />
                    </Card>
                  </Box>
                </Flex>
              </Content>
            );
          }}
        </Query>
      </Layout>
    );
  }
}
