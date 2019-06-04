import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import OrgChart from "../components/OrgChart";
import Layout from "../components/Layout";

export const LIST_ALL_PEOPLE_QUERY = gql`
  query listAllPeople {
    users(offset: 0, limit: 1000) {
      id
      name
      profile {
        title
        reportsTo {
          id
          name
          profile {
            title
          }
        }
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
    if (node.profile && node.profile.reportsTo) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node.profile.reportsTo.id]].children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
};

const Node = ({ node }) => {
  return <div>{node.name}</div>;
};

export default () => (
  <Layout>
    <h1>Org Chart</h1>
    <style global jsx>{`
      .reactOrgChart {
        margin: 2px;
        display: block;
      }

      .reactOrgChart .orgNodeChildGroup .node {
        border: solid 1px #000000;
        display: inline-block;
        padding: 4px;
        width: 100px;
      }

      .reactOrgChart .orgNodeChildGroup .nodeCell {
        text-align: center;
      }

      .reactOrgChart .orgNodeChildGroup .nodeCell div {
        border: solid 3px red;
        border-radius: 3px;
        padding: 5px;
        width: 150px;
        display: inline-block;
      }

      .reactOrgChart .orgNodeChildGroup .nodeGroupCell {
        vertical-align: top;
      }

      .reactOrgChart .orgNodeChildGroup .nodeGroupLineVerticalMiddle {
        height: 25px;
        width: 50%;
        border-right: solid 3px red;
      }

      .reactOrgChart .nodeLineBorderTop {
        border-top: solid 3px red;
      }

      .reactOrgChart table {
        border-collapse: collapse;
        border: none;
        margin: 0 auto;
      }

      .reactOrgChart td {
        padding: 0;
      }

      .reactOrgChart table.nodeLineTable {
        width: 100%;
      }

      .reactOrgChart table td.nodeCell {
        width: 50%;
      }
    `}</style>
    <Query query={LIST_ALL_PEOPLE_QUERY}>
      {({ loading, error, data, fetchMore }) => {
        if (error) return <ErrorMessage message="Error loading people." />;
        if (loading) return <div>Loading</div>;
        const { users } = data;
        users.sort((a, b) => {
          if (!!a.reportsTo && !!b.reportsTo) {
            return 0;
          } else if (!!a.reportsTo) {
            return 1;
          }
          return -1;
        });
        const dataSource = listToTree(users);
        return <OrgChart tree={dataSource} NodeComponent={Node} />;
      }}
    </Query>
  </Layout>
);
