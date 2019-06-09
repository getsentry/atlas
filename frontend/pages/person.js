import React, { Component } from "react";
import Link from "next/link";

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
        <p>
          {" "}
          <Link
            href={{ pathname: "/updatePerson", query: { id: this.props.id } }}
            as={`/people/${this.props.id}/update`}
          >
            <a>Edit Profile</a>
          </Link>
        </p>
      </Layout>
    );
  }
}
