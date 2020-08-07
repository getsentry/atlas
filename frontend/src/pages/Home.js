import React, { Component } from "react";
import PropTypes from "prop-types";
import { Query } from "react-apollo";
import { Flex, Box } from "@rebass/grid/emotion";
import styled from "@emotion/styled";
import moment from "moment";

import Card from "../components/Card";
import Content from "../components/Content";
import ErrorMessage from "../components/ErrorMessage";
import Layout from "../components/Layout";
import PageLoader from "../components/PageLoader";
import PersonList from "../components/PersonList";
import { LIST_PEOPLE_QUERY } from "../queries";

const SearchInput = styled.input`
  background: #273444;
  border: 0;
  color: #fff;
`;

export default class Home extends Component {
  static contextTypes = {
    router: PropTypes.object,
  };

  onSearch = (e) => {
    e.preventDefault();
    this.context.router.push({
      pathname: "/people",
      query: { query: this.state.query },
    });
  };

  onChangeQuery = (e) => {
    this.setState({ query: e.target.value });
  };

  render() {
    return (
      <Layout title="Home">
        <Content>
          <Box flex="1" mx={3}>
            <Card>
              <form onSubmit={this.onSearch}>
                <SearchInput
                  type="text"
                  name="query"
                  placeholder="find a human"
                  onChange={this.onChangeQuery}
                />
              </form>
            </Card>
          </Box>
          <Flex flexWrap="wrap">
            <Box width={[1, 1 / 2]} px={3}>
              <Card>
                <h2>Newest Sentries</h2>
                <Query
                  query={LIST_PEOPLE_QUERY}
                  variables={{
                    limit: 5,
                    dateStartedAfter: moment().subtract(1, "months").format("YYYY-MM-DD"),
                    orderBy: "dateStarted",
                  }}
                >
                  {({ loading, error, data }) => {
                    if (loading) return <PageLoader />;
                    if (error || !data.users)
                      return <ErrorMessage message="Error loading people." />;
                    const { users } = data;
                    if (!users.results.length) {
                      return (
                        <p>
                          {`It looks like there's been no newly added teammates in the last
              month.`}
                        </p>
                      );
                    }
                    return <PersonList people={users.results} withStartDate />;
                  }}
                </Query>
              </Card>
              <Card>
                <h2>Birthdays</h2>
                <Query
                  query={LIST_PEOPLE_QUERY}
                  variables={{
                    limit: 5,
                    birthdayAfter: moment().subtract(14, "days").format("YYYY-MM-DD"),
                    birthdayBefore: moment().add(14, "days").format("YYYY-MM-DD"),
                    orderBy: "birthday",
                  }}
                >
                  {({ loading, error, data }) => {
                    if (loading) return <PageLoader />;
                    if (error || !data.users)
                      return <ErrorMessage message="Error loading people." />;
                    const { users } = data;
                    if (!users.results.length) {
                      return (
                        <p>{`It looks like there's no recent or upcoming birthdays.`}</p>
                      );
                    }
                    return <PersonList people={users.results} withBirthday />;
                  }}
                </Query>
              </Card>
            </Box>
            <Box width={[1, 1 / 2]} px={3}>
              <Card>
                <h2>Anniversaries</h2>
                <Query
                  query={LIST_PEOPLE_QUERY}
                  variables={{
                    limit: 5,
                    anniversaryAfter: moment().subtract(14, "days").format("YYYY-MM-DD"),
                    anniversaryBefore: moment().add(14, "days").format("YYYY-MM-DD"),
                    orderBy: "anniversary",
                  }}
                >
                  {({ loading, error, data }) => {
                    if (loading) return <PageLoader />;
                    if (error || !data.users)
                      return <ErrorMessage message="Error loading people." />;
                    const { users } = data;
                    if (!users.results.length) {
                      return (
                        <p>{`It looks like there's no recent or upcoming anniversaries.`}</p>
                      );
                    }
                    return <PersonList people={users.results} withAnniversary />;
                  }}
                </Query>
              </Card>
            </Box>
          </Flex>
        </Content>
      </Layout>
    );
  }
}
