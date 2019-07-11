import React, { Component } from "react";

import Content from "../components/Content";
import Layout from "../components/Layout";
import UpdatePersonForm from "../components/UpdatePersonForm";

export default class extends Component {
  render() {
    return (
      <Layout>
        <Content>
          <UpdatePersonForm id={this.props.params.id} />
        </Content>
      </Layout>
    );
  }
}
