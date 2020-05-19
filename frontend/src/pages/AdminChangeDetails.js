import React from "react";
import { Query } from "react-apollo";
import moment from "moment";
import { ArrowRightAlt } from "@material-ui/icons";

import Card from "../components/Card";
import ChangeHeading from "../components/ChangeHeading";
import DefinitionList from "../components/DefinitionList";
import PageLoader from "../components/PageLoader";
import PersonLink from "../components/PersonLink";
import { LIST_CHANGES_QUERY } from "../queries";

export default ({ params }) => (
  <section>
    <Card>
      <h1>Change Details</h1>
    </Card>
    <Card withPadding>
      <Query
        query={LIST_CHANGES_QUERY}
        variables={{
          limit: 1,
          id: params.changeId
        }}
      >
        {({ loading, error, data }) => {
          if (error) throw error;
          if (loading) return <PageLoader />;
          const {
            changes: [change]
          } = data;

          const previousValues = change.previous ? JSON.parse(change.previous) : {};
          const newValues = change.changes ? JSON.parse(change.changes) : {};
          return (
            <div>
              <h2>Meta</h2>
              <DefinitionList>
                <dt>Entity</dt>
                <dd>
                  <ChangeHeading change={change} avatarSize={16} />
                </dd>

                <dt>Version</dt>
                <dd>v{change.version}</dd>

                <dt>Change Author</dt>
                <dd>
                  {change.user ? (
                    <PersonLink user={change.user} avatarSize={16} />
                  ) : (
                    <em>n/a</em>
                  )}
                </dd>

                <dt>Change Date</dt>
                <dd>{moment(change.timestamp).format("lll")}</dd>
              </DefinitionList>
              <h2>Updates</h2>
              <DefinitionList>
                {Object.keys(newValues).map(key => (
                  <React.Fragment key={key}>
                    <dt>{key}</dt>
                    <dd>
                      {previousValues[key] || <em>no value</em>} <ArrowRightAlt />{" "}
                      {newValues[key] || <em>no value</em>}
                    </dd>
                  </React.Fragment>
                ))}
              </DefinitionList>
            </div>
          );
        }}
      </Query>
    </Card>
  </section>
);
