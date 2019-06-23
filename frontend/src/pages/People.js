import React from "react";

import Box from "../components/Box";
import Layout from "../components/Layout";
import PeopleList from "../components/PeopleList";

export default () => (
  <Layout>
    <Box>
      <h1>People</h1>
      <PeopleList />
    </Box>
  </Layout>
);
