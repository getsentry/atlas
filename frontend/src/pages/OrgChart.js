import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import OrgChart from "../components/OrgChart";
import Layout from "../components/Layout";
import PageLoader from "../components/PageLoader";
import PersonLink from "../components/PersonLink";

export const LIST_ALL_PEOPLE_QUERY = gql`
  query listAllPeople {
    users(offset: 0, limit: 1000, titlesOnly: true) {
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
`;

const listToTree = list => {
  var map = {},
    node,
    roots = [],
    i;
  for (i = 0; i < list.length; i += 1) {
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
  }
  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.reportsTo) {
      // if you have dangling branches check that map[node.parentId] exists
      try {
        list[map[node.reportsTo.id]].children.push(node);
      } catch (err) {
        console.error("failed to insert node into tree (missing parent)", node);
      }
    } else {
      roots.push(node);
    }
  }
  return roots;
};

const Node = ({ node }) => {
  return (
    <div className="nodeItem">
      <PersonLink user={node} />
    </div>
  );
};

export default () => (
  <Layout>
    <Query query={LIST_ALL_PEOPLE_QUERY}>
      {({ loading, error, data }) => {
        if (error) throw error;
        if (loading) return <PageLoader />;
        const { users } = data;
        const tree = listToTree(users);
        return <OrgChart tree={tree} NodeComponent={Node} />;
      }}
    </Query>
  </Layout>
);
