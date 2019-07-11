import React from "react";

import Card from "../components/Card";
import Layout from "../components/Layout";
import OfficeList from "../components/OfficeList";

export default () => (
  <Layout>
    <Card>
      <h1>Offices</h1>
      <OfficeList />
    </Card>
  </Layout>
);
