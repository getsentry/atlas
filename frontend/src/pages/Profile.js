import React, { Component } from "react";
import { Link } from "react-router";

import Layout from "../components/Layout";
import Person from "../components/Person";

export default class extends Component {
  render() {
    return (
      <Layout>
        <Person id={this.props.params.id} />
        <p>
          <Link to={`/people/${this.props.id}/update`}>Edit Profile</Link>
        </p>
      </Layout>
    );
  }
}
