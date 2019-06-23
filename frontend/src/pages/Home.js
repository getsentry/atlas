import React, { Component } from "react";
import { Link } from "react-router";
import { Query } from "react-apollo";
import { connect } from "react-redux";
import gql from "graphql-tag";
import moment from "moment";

import Box from "../components/Box";
import ErrorMessage from "../components/ErrorMessage";
import Layout from "../components/Layout";
import PersonList from "../components/PersonList";
import { LIST_PEOPLE_QUERY } from "../components/PeopleList";
import apolloClient from "../utils/apollo";

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

class Home extends Component {
  render() {
    const { user } = this.props;
    return (
      <Layout title="Home">
        <Box>
          <h1>Welcome to Atlas</h1>
          <p>Atlas is your map to Sentry.</p>
          <p>We could probably put the newest hires here? Anniversaries? Birthdays?</p>
        </Box>
        <Box>
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
              if (loading) return <div>Loading</div>;
              const { users } = data;
              if (!users.length) {
                return (
                  <p>
                    {`It looks like there's been no newly added teammates in the last
              month.`}
                  </p>
                );
              }
              return <PersonList people={users} />;
            }}
          </Query>
        </Box>
        <Box>
          <h2>Explore</h2>
          <p>Here are some pages CKJ needs to figure out where to place links to...</p>
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
        </Box>
        {user && user.isSuperuser && (
          <Box>
            <h2>Admin Controls</h2>
            <ul>
              <li>
                <a onClick={syncGoogle}>Force Google Sync</a>
              </li>
            </ul>
          </Box>
        )}
      </Layout>
    );
  }
}

export default connect(({ auth }) => ({
  user: auth.user
}))(Home);
