import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import { OrgChart } from "@ctrl/react-orgchart";
import { arrayToTree } from "performant-array-to-tree";
import styled from "@emotion/styled";

import colors from "../colors";
import Layout from "../components/Layout";
import PageLoader from "../components/PageLoader";
import avatarPersonnel from "../images/avatar.svg";

export const LIST_ALL_PEOPLE_QUERY = gql`
  query listAllPeople {
    users(offset: 0, limit: 1000, titlesOnly: true, humansOnly: true) {
      results {
        id
        name
        email
        title
        photo {
          data
          width
          height
          mimeType
        }
        reportsTo {
          id
        }
      }
    }
  }
`;

export default () => (
  <Layout>
    <Query query={LIST_ALL_PEOPLE_QUERY}>
      {({ loading, error, data }) => {
        if (error) throw error;
        if (loading) return <PageLoader />;
        const { users } = data;
        const formattedUsers = users.results.map(x => {
          const avatar =
            (x.photo && x.photo.data && `data:image/jpeg;base64,${x.photo.data}`) ||
            avatarPersonnel;

          return {
            id: x.id,
            entity: {
              ...x,
              avatar
            },
            parentId: x.reportsTo && x.reportsTo.id
          };
        });
        const tree = arrayToTree(formattedUsers, { dataField: null });

        return (
          <Container>
            <OrgChart tree={tree[0]} borderColor={colors.primary400} />
          </Container>
        );
      }}
    </Query>
  </Layout>
);

const Container = styled.div`
  height: calc(100vh - 200px);
  width: 100vw;
`;
