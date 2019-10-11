import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import { Link } from "react-router";
import { Query } from "react-apollo";
import { Flex, Box } from "@rebass/grid/emotion";

import colors from "../colors";
import Card from "../components/Card";
import Content from "../components/Content";
import Layout from "../components/Layout";
import PeopleList from "../components/PeopleList";
import PageLoader from "../components/PageLoader";
import {
  LIST_DEPARTMENTS_QUERY,
  LIST_EMPLOYEE_TYPES_QUERY,
  LIST_OFFICES_QUERY
} from "../queries";

const Filter = styled(({ className, location, name, title, allLabel, choices }) => {
  const value = location.query[name];
  return (
    <Card className={className}>
      <h2>{title}</h2>
      <ul>
        <li className={!value ? "active" : ""}>
          <Link
            to={{
              pathname: location.pathname,
              query: {
                ...(location.query || {}),
                [name]: undefined
              }
            }}
          >
            {allLabel}
          </Link>
        </li>
        {choices.map(c => (
          <li key={c.id} className={value === c.id ? "active" : ""}>
            <Link
              to={{
                pathname: location.pathname,
                query: {
                  ...(location.query || {}),
                  [name]: c.id
                }
              }}
            >
              <Flex>
                <Box flex="1">{c.value}</Box>
                <Box style={{ textAlign: "right" }}>
                  {c.count > 0 ? c.count.toLocaleString() : null}
                </Box>
              </Flex>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
})`
  ul {
    margin: 0 0 0.75rem;
    padding: 0;
    list-style: none;
  }
  li {
    margin: 0 -0.5rem;

    a {
      display: block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    &.active a {
      background: ${colors.primary};
      color: ${colors.white};
    }
  }
`;

function DepartmentFilter({ location }) {
  return (
    <Query
      query={LIST_DEPARTMENTS_QUERY}
      variables={{ peopleOnly: true, rootOnly: true }}
    >
      {({ loading, error, data }) => {
        if (error) throw error;
        if (loading) return <PageLoader />;
        const { departments } = data;
        return (
          <Filter
            location={location}
            title="Department"
            name="department"
            allLabel="All Departments"
            choices={departments.map(d => ({
              id: d.id,
              value: d.name,
              count: d.numPeople
            }))}
          />
        );
      }}
    </Query>
  );
}

function OfficeFilter({ location }) {
  return (
    <Query query={LIST_OFFICES_QUERY}>
      {({ loading, error, data }) => {
        if (error) throw error;
        if (loading) return <PageLoader />;
        const { offices } = data;
        return (
          <Filter
            location={location}
            title="Office"
            name="office"
            allLabel="All Offices"
            choices={offices.map(d => ({ id: d.id, value: d.name, count: d.numPeople }))}
          />
        );
      }}
    </Query>
  );
}

function EmployeeTypeFilter({ location }) {
  return (
    <Query query={LIST_EMPLOYEE_TYPES_QUERY}>
      {({ loading, error, data }) => {
        if (error) throw error;
        if (loading) return <PageLoader />;
        const { employeeTypes } = data;
        return (
          <Filter
            location={location}
            title="Type"
            name="employeeType"
            allLabel="All People"
            choices={employeeTypes.map(d => ({
              id: d.id,
              value: d.name,
              count: d.numPeople
            }))}
          />
        );
      }}
    </Query>
  );
}

const SearchInput = styled.input`
  background: #273444;
  border: 0;
  color: #fff;
`;

export default class People extends Component {
  static contextTypes = {
    router: PropTypes.object
  };

  onSearch = e => {
    e.preventDefault();
    this.context.router.push({
      pathname: this.context.router.location.pathname,
      query: { ...this.context.router.location.query, query: this.state.query }
    });
  };

  onChangeQuery = e => {
    this.setState({ query: e.target.value });
  };

  render() {
    return (
      <Layout>
        <Content>
          <Card>
            <Flex mx={-3}>
              <Box width={250} mx={3}>
                <h1>People</h1>
              </Box>
              <Box flex="1" mx={3}>
                <form onSubmit={this.onSearch}>
                  <SearchInput
                    type="text"
                    name="query"
                    placeholder="search"
                    onChange={this.onChangeQuery}
                  />
                </form>
              </Box>
            </Flex>
          </Card>
          <Flex mx={-3}>
            <Box width={250} mx={3}>
              <OfficeFilter location={this.context.router.location} />
              <DepartmentFilter location={this.context.router.location} />
              <EmployeeTypeFilter location={this.context.router.location} />
            </Box>
            <Box flex="1" mx={3}>
              <PeopleList query={this.context.router.location.query} />
            </Box>
          </Flex>
        </Content>
      </Layout>
    );
  }
}
