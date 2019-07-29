import React, { Component } from "react";
import { Link } from "react-router";
import { Query } from "react-apollo";
import { Flex, Box } from "@rebass/grid/emotion";
import gql from "graphql-tag";
import moment from "moment";

import Button from "../components/Button";
import Card from "../components/Card";
import Content from "../components/Content";
import ErrorMessage from "../components/ErrorMessage";
import Layout from "../components/Layout";
import PageLoader from "../components/PageLoader";
import PersonList from "../components/PersonList";
import { LIST_PEOPLE_QUERY } from "../queries";
import apolloClient from "../utils/apollo";
import SuperuserOnly from "../components/SuperuserOnly";

export const SYNC_GOOGLE_MUTATION = gql`
  mutation syncGoogle {
    syncGoogle {
      ok
      errors
    }
  }
`;

const syncGoogle = () => {
  window.alert("Forcing a Google sync");
  apolloClient
    .mutate({
      mutation: SYNC_GOOGLE_MUTATION
    })
    .then(() => {
      window.alert("Cool we did it");
    });
};

export default class Home extends Component {
  render() {
    return (
      <Layout title="Home">
        <Content>
          <Flex>
            <Box width={1 / 2} px={3}>
              <Card>
                <h2>Newest Sentries</h2>
                <Query
                  query={LIST_PEOPLE_QUERY}
                  variables={{
                    limit: 5,
                    dateStartedAfter: moment()
                      .subtract(1, "months")
                      .format("YYYY-MM-DD"),
                    orderBy: "dateStarted"
                  }}
                >
                  {({ loading, error, data }) => {
                    if (error) return <ErrorMessage message="Error loading people." />;
                    if (loading) return <PageLoader />;
                    const { users } = data;
                    if (!users.length) {
                      return (
                        <p>
                          {`It looks like there's been no newly added teammates in the last
              month.`}
                        </p>
                      );
                    }
                    return <PersonList people={users} withStartDate />;
                  }}
                </Query>
              </Card>
              <Card>
                <h2>Birthdays</h2>
                <Query
                  query={LIST_PEOPLE_QUERY}
                  variables={{
                    limit: 5,
                    birthdayAfter: moment()
                      .subtract(14, "days")
                      .format("YYYY-MM-DD"),
                    birthdayBefore: moment()
                      .add(14, "days")
                      .format("YYYY-MM-DD"),
                    orderBy: "birthday"
                  }}
                >
                  {({ loading, error, data }) => {
                    if (error) return <ErrorMessage message="Error loading people." />;
                    if (loading) return <PageLoader />;
                    const { users } = data;
                    if (!users.length) {
                      return (
                        <p>{`It looks like there's no recent or upcoming birthdays.`}</p>
                      );
                    }
                    return <PersonList people={users} withBirthday />;
                  }}
                </Query>
              </Card>
              <Card>
                <h2>Anniversaries</h2>
                <Query
                  query={LIST_PEOPLE_QUERY}
                  variables={{
                    limit: 5,
                    anniversaryAfter: moment()
                      .subtract(14, "days")
                      .format("YYYY-MM-DD"),
                    anniversaryBefore: moment()
                      .add(14, "days")
                      .format("YYYY-MM-DD"),
                    orderBy: "anniversary"
                  }}
                >
                  {({ loading, error, data }) => {
                    if (error) return <ErrorMessage message="Error loading people." />;
                    if (loading) return <PageLoader />;
                    const { users } = data;
                    if (!users.length) {
                      return (
                        <p>{`It looks like there's no recent or upcoming anniversaries.`}</p>
                      );
                    }
                    return <PersonList people={users} withAnniversary />;
                  }}
                </Query>
              </Card>
            </Box>
            <Box width={1 / 2} px={3}>
              <Card>
                <h2>Explore</h2>
                <p>
                  Here are some pages we need to figure out where to place links to...
                </p>
                <ul>
                  <li>
                    <Link to="/people">/people</Link>
                  </li>
                  <li>
                    <Link to="/offices">/offices</Link>
                  </li>
                  <li>
                    <Link to="/orgChart">/orgChart</Link>
                  </li>
                </ul>
              </Card>
              <SuperuserOnly>
                <Card>
                  <h2>Admin Controls</h2>
                  <ul>
                    <li>
                      <Button onClick={syncGoogle}>Force Google Sync</Button>
                    </li>
                    <li>
                      <Link to="/admin/audit">Look for broken profiles</Link>
                    </li>
                    <li>
                      <Link to="/admin/update-people">Bulk update profiles</Link>
                    </li>
                  </ul>
                </Card>
              </SuperuserOnly>
            </Box>
          </Flex>
        </Content>
      </Layout>
    );
  }
}
