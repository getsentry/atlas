import React, { Component } from "react";

import Layout from "../components/Layout";
import Person from "../components/Person";

export default class extends Component {
  render() {
    return (
      <Layout>
        <Person id={this.props.params.id} />
      </Layout>
    );
  }
}
