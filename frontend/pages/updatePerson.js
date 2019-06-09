import React, { Component } from "react";
import Layout from "../components/Layout";
import UpdatePersonForm from "../components/UpdatePersonForm";

export default class extends Component {
  static async getInitialProps({ query: { id } }) {
    return { id };
  }

  render() {
    return (
      <Layout>
        <UpdatePersonForm id={this.props.id} />
      </Layout>
    );
  }
}
