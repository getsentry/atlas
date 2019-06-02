import React, { Component } from "react";
import Layout from "../components/Layout";
import Person from "../components/Person";

export default class extends Component {
  static async getInitialProps({ query: { id } }) {
    return { id };
  }

  render() {
    return (
      <Layout>
        <Person id={this.props.id} />
      </Layout>
    );
  }
}
