import React, { Component } from "react";
import { Query } from "react-apollo";
import styled from "@emotion/styled";
import { Flex, Box } from "@rebass/grid/emotion";
import { Settings } from "@material-ui/icons";

import colors from "../colors";
import Card from "../components/Card";
import Content from "../components/Content";
import DefinitionList from "../components/DefinitionList";
import ErrorMessage from "../components/ErrorMessage";
import Layout from "../components/Layout";
import IconLink from "../components/IconLink";
import OfficeMap from "../components/OfficeMap";
import PersonCard from "../components/PersonCard";
import { GET_OFFICE_QUERY, LIST_PEOPLE_QUERY } from "../queries";
import SuperuserOnly from "../components/SuperuserOnly";

const OfficeContainer = styled.article`
  h1 {
    margin: 0;
  }
  h4 {
    margin: 0;
    font-weight: 500;
  }
  .meta {
    color: ${colors.white};
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .meta .name,
  .meta .contact,
  .meta .map {
    text-align: center;
    margin-bottom: 1rem;
  }
  .meta .contact > div {
    margin-bottom: 0.5rem;
  }
  .meta .map {
    width: 196px;
    height: 196px;
    border-radius: 50%;
    overflow: hidden;
  }
  .meta .map iframe {
    max-width: 100%;
    max-height: 100%;
    border-radius: 50%;
  }
  .meta h1 {
    font-size: 1.4em;
    margin-bottom: 0;
  }
  .meta h2 {
    font-size: 1.3em;
    margin-bottom: 0;
  }
  .meta h4 {
    font-weight: normal;
    font-size: 1em;
  }
  .meta a {
    color: #fff;
  }
`;

const OfficeHeader = styled.div`
  color: ${colors.white};
  margin-bottom: 1.5rem;
`;

export default class Office extends Component {
  render() {
    return (
      <Layout>
        <OfficeContainer>
          <Query query={GET_OFFICE_QUERY} variables={{ id: this.props.params.id }}>
            {({ loading, error, data }) => {
              if (error) return <ErrorMessage message="Error loading office." />;
              if (loading) return <div>Loading</div>;
              if (!data.offices.length)
                return <ErrorMessage message="Couldn't find that office." />;
              const thisOffice = data.offices[0];
              return (
                <Content>
                  <Flex>
                    <Box px={3} width={300}>
                      <section className="meta">
                        {thisOffice.lat && thisOffice.lng && (
                          <div className="map">
                            <OfficeMap
                              office={thisOffice}
                              width="100%"
                              height={196}
                              zoom={15}
                            />
                          </div>
                        )}
                        <div className="name">
                          <h1>{thisOffice.name}</h1>
                        </div>
                        <div className="contact">
                          {thisOffice.location && <div>{thisOffice.location}</div>}
                          {thisOffice.postalCode ||
                            (thisOffice.regionCode && (
                              <div>
                                {thisOffice.postalCode || ""}{" "}
                                {thisOffice.regionCode || ""}
                              </div>
                            ))}
                        </div>
                        <Card>
                          <DefinitionList prefixWidth={80}>
                            <dt>ID</dt>
                            <dd>{thisOffice.externalId}</dd>
                            <dt>People</dt>
                            <dd>{thisOffice.numPeople.toLocaleString()}</dd>
                            <dt>Lat</dt>
                            <dd>{thisOffice.lat}</dd>
                            <dt>Lng</dt>
                            <dd>{thisOffice.lng}</dd>
                          </DefinitionList>
                        </Card>
                      </section>
                    </Box>
                    <Box px={3} flex="1">
                      <OfficeHeader>
                        <Flex alignItems="center">
                          <Box px={3} flex="1">
                            <h1>People</h1>
                          </Box>
                          <Box px={3}>
                            <SuperuserOnly>
                              <IconLink
                                icon={<Settings />}
                                to={`/offices/${thisOffice.id}/update`}
                                style={{ fontSize: "0.9em" }}
                              >
                                Edit
                              </IconLink>
                            </SuperuserOnly>
                          </Box>
                        </Flex>
                      </OfficeHeader>
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
        </OfficeContainer>
      </Layout>
    );
  }
}
