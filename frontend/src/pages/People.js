import React from "react";

import Card from "../components/Card";
import Layout from "../components/Layout";
import PeopleList from "../components/PeopleList";

export default () => (
  <Layout>
    <Card>
      <h1>People</h1>
      <PeopleList />
    </Card>
  </Layout>
);
