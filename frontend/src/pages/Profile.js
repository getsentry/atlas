import React, { Component } from "react";

import Layout from "../components/Layout";
import Person from "../components/Person";

export default class extends Component {
  render() {
    return (
      <Layout>
        <Person email={this.props.params.email} />
        <input
          type="button"
          onClick={() => {
            throw new Error("break");
          }}
          value="Break me"
        />
      </Layout>
    );
  }
}
