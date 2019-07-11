import React from "react";

import Card from "../components/Card";
import Content from "../components/Content";
import Layout from "../components/Layout";
import PeopleList from "../components/PeopleList";

export default () => (
  <Layout>
    <Content>
      <Card>
        <h1>People</h1>
        <PeopleList />
      </Card>
    </Content>
  </Layout>
);
