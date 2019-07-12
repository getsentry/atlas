import React, { Component } from "react";
import { Query } from "react-apollo";
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
import PersonCard from "../components/PersonCard";
import { GET_OFFICE_QUERY, LIST_PEOPLE_QUERY } from "../queries";

const OfficeHeader = styled.div`
  color: ${colors.white};
  margin-bottom: 1.5rem;
`;

export default class extends Component {
  render() {
    return (
      <Layout>
        <Query query={GET_OFFICE_QUERY} variables={{ id: this.props.params.id }}>
          {({ loading, error, data }) => {
            if (error) return <ErrorMessage message="Error loading office." />;
            if (loading) return <div>Loading</div>;
            if (!data.offices.length)
              return <ErrorMessage message="Couldn't find that office." />;
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
                        to={`/offices/${thisOffice.id}/update`}
                        style={{ fontSize: "0.9em" }}
                      >
                        Edit
                      </IconLink>
                    </Box>
                  </Flex>
                </OfficeHeader>
                <Flex>
                  <Box px={3} width={300}>
                    {thisOffice.location && (
                      <Card withPadding>{thisOffice.location}</Card>
                    )}
                    <OfficeMap office={thisOffice} width="100%" height={200} zoom={15} />
                  </Box>
                  <Box px={3} flex="1">
                    <Query
                      query={LIST_PEOPLE_QUERY}
                      variables={{ office: thisOffice.id }}
                    >
                      {({ loading, error, data }) => {
                        if (error)
                          return <ErrorMessage message="Error loading people." />;
                        if (loading) return <div>Loading</div>;
                        return (
                          <Flex flexWrap="wrap" mx={-2}>
                            {data.users.map(u => (
                              <Box px={1} mx="auto" width={196}>
                                <PersonCard user={u} key={u.id} />
                              </Box>
                            ))}
                          </Flex>
                        );
                      }}
                    </Query>
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
