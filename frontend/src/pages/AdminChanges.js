import React from "react";
import { Link } from "react-router";
import { Query } from "react-apollo";
import moment from "moment";

import Card from "../components/Card";
import PageLoader from "../components/PageLoader";
import ChangeHeading from "../components/ChangeHeading";
import PersonLink from "../components/PersonLink";
import { LIST_CHANGES_QUERY } from "../queries";

export default () => (
  <section>
    <Card>
      <h1>Changes</h1>
    </Card>
    <Card>
      <table>
        <thead>
          <tr>
            <th>Entity</th>
            <th style={{ width: 50 }}>Changes</th>
            <th style={{ width: 200 }}>Author</th>
            <th style={{ width: 200, textAlign: "right" }}>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          <Query
            query={LIST_CHANGES_QUERY}
            variables={{
              limit: 1000
            }}
          >
            {({ loading, error, data }) => {
              if (error) throw error;
              if (loading) return <PageLoader />;
              const { changes } = data;
              return changes.map(c => (
                <tr>
                  <td>
                    <ChangeHeading change={c} avatarSize={16} />
                  </td>
                  <td>
                    <Link to={`/admin/changes/${c.id}`}>v{c.version}</Link>
                  </td>
                  <td>
                    {c.user ? <PersonLink user={c.user} avatarSize={16} /> : <em>n/a</em>}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {moment(c.timestamp).format("lll")}
                  </td>
                </tr>
              ));
            }}
          </Query>
        </tbody>
      </table>
    </Card>
  </section>
);
