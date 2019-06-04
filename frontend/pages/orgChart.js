import React from "react";
import { Query } from "react-apollo";
import gql from "graphql-tag";

import OrgChart from "../components/OrgChart";
import Layout from "../components/Layout";
import PersonLink from "../components/PersonLink";

export const LIST_ALL_PEOPLE_QUERY = gql`
  query listAllPeople {
    users(offset: 0, limit: 1000) {
      id
      name
      profile {
        title
        photoUrl
        reportsTo {
          id
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
  //   list.sort((a, b) => {
  //     if (!!a.reportsTo && !!b.reportsTo) {
  //       return 0;
  //     } else if (!!a.reportsTo) {
  //       return 1;
  //     }
  //     return -1;
  //   });
  for (i = 0; i < list.length; i += 1) {
    map[list[i].id] = i; // initialize the map
    list[i].children = []; // initialize the children
  }
  for (i = 0; i < list.length; i += 1) {
    node = list[i];
    if (node.profile && node.profile.reportsTo) {
      // if you have dangling branches check that map[node.parentId] exists
      list[map[node.profile.reportsTo.id]].children.push(node);
      // some inefficiencies as we have now sorted twice..
      list[map[node.profile.reportsTo.id]].children.sort((a, b) => {
        return b.name - a.name;
      });
    } else {
      roots.push(node);
    }
  }
  roots.sort((a, b) => {
    return b.name - a.name;
  });
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
    <h1>Org Chart</h1>
    <style global jsx>{`
      .reactOrgChart {
        margin: 2px;
        display: block;
        zoom: 0.85;
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

      .reactOrgChart .orgNodeChildGroup .nodeCell .nodeItem {
        border: solid 1px #ddd;
        border-radius: 3px;
        padding: 5px;
        width: 200px;
        display: inline-block;
      }
      .reactOrgChart .orgNodeChildGroup .nodeCell .nodeItem img {
        display: inline-block;
        width: 32px;
      }

      .reactOrgChart .orgNodeChildGroup .nodeGroupCell {
        vertical-align: top;
      }

      .reactOrgChart .orgNodeChildGroup .nodeGroupLineVerticalMiddle {
        height: 25px;
        width: 50%;
        border-right: solid 1px #ddd;
      }

      .reactOrgChart .nodeLineBorderTop {
        border-top: solid 1px #ddd;
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
        const dataSource = listToTree(users);
        return <OrgChart tree={dataSource} NodeComponent={Node} />;
      }}
    </Query>
  </Layout>
);
