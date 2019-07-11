import React from "react";

import Card from "../components/Card";
import Content from "../components/Content";
import Layout from "../components/Layout";
import OfficeList from "../components/OfficeList";

export default () => (
  <Layout>
    <Content>
      <Card>
        <h1>Offices</h1>
        <OfficeList />
      </Card>
    </Content>
  </Layout>
);
