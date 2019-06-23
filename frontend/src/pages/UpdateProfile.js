import React, { Component } from "react";
import Layout from "../components/Layout";
import UpdatePersonForm from "../components/UpdatePersonForm";

export default class extends Component {
  render() {
    return (
      <Layout>
        <UpdatePersonForm id={this.props.params.id} />
      </Layout>
    );
  }
}
