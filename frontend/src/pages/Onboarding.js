import React from "react";
import { connect } from "react-redux";

import Card from "../components/Card";
import Content from "../components/Content";
import Layout from "../components/Layout";
import UpdatePersonForm from "../components/UpdatePersonForm";

const Onboarding = ({ user }) => (
  <Layout>
    <Content>
      <Card>
        <h1>Welcome to Atlas</h1>
        <p>Please help us fill in some details about yourself.</p>
        <p>
          <small>
            Note: All fields are optional, so only share what you're comfortable with.
          </small>
        </p>
      </Card>
      {!!user && <UpdatePersonForm email={user.email} onboarding />}
    </Content>
  </Layout>
);

export default connect(({ auth }) => ({
  user: auth.user,
}))(Onboarding);
