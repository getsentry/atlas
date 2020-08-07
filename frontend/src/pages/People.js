import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "@emotion/styled";
import Select from "react-select";
import { Link } from "react-router";
import { Query } from "react-apollo";
import { Flex, Box } from "@rebass/grid/emotion";

import colors from "../colors";
import Card from "../components/Card";
import Content from "../components/Content";
import { selectStyles } from "../components/FieldWrapper";
import Layout from "../components/Layout";
import PeopleList from "../components/PeopleList";
import PageLoader from "../components/PageLoader";
import { SEARCH_PEOPLE_QUERY } from "../queries";
import { getColumnTitle } from "../utils/strings";
import PeopleViewSelectors from "../components/PeopleViewSelectors";

export const peopleQueryVars = {
  offset: 0,
  limit: 100,
  orderBy: "name"
};

const DEFAULT_ORDER_BY = "name";

const ORDER_BY_OPTIONS = [
  "name",
  "dateStarted",
  "department",
  "team",
  "anniversary",
  "birthday"
];

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

      &:hover {
        background: ${colors.cardBackgroundHover};
      }
    }

    &.active a {
      background: ${colors.primary};
      color: ${colors.white};
    }
  }
`;

const SearchInput = styled.input`
  background: #273444;
  border: 0;
  color: #fff;
`;

export default class People extends Component {
  static contextTypes = {
    router: PropTypes.object
  };

  constructor(...params) {
    super(...params);
    const query = this.context.router.location.query;

    this.state = {
      query: query.query || "",
      orderBy: DEFAULT_ORDER_BY
    };
  }

  onSearch = e => {
    e && e.preventDefault();
    this.context.router.push({
      pathname: this.context.router.location.pathname,
      query: {
        ...this.context.router.location.query,
        query: this.state.query,
        orderBy: this.state.orderBy
      }
    });
  };

  onChangeQuery = e => {
    this.setState({ query: e.target.value });
  };

  onChangeOrderBy = ({ value }) => {
    this.context.router.push({
      pathname: this.context.router.location.pathname,
      query: {
        ...this.context.router.location.query,
        query: this.state.query,
        orderBy: value
      }
    });
  };

  render() {
    const { location } = this.context.router;
    const columns = location.query.columns
      ? location.query.columns.split(",")
      : undefined;

    const orderByOptions = ORDER_BY_OPTIONS.map(a => ({
      value: a,
      label: getColumnTitle(a)
    }));

    return (
      <Layout>
        <Content>
          <Card>
            <Flex mx={-3} alignItems="center">
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
              <Box mr={3} width={200}>
                <div style={{ marginBottom: "1rem" }}>
                  <Select
                    styles={selectStyles}
                    name="orderBy"
                    options={orderByOptions}
                    value={orderByOptions.find(
                      o => o.value == this.state.orderBy || DEFAULT_ORDER_BY
                    )}
                    onChange={this.onChangeOrderBy}
                  />
                </div>
              </Box>
              <PeopleViewSelectors current={"people"} />
            </Flex>
          </Card>
          <Query
            query={SEARCH_PEOPLE_QUERY}
            variables={{ peopleQueryVars, ...location.query }}
          >
            {({ loading, error, data, fetchMore }) => {
              if (error) throw error;
              if (loading) return <PageLoader />;
              const {
                users: {
                  results,
                  facets: { departments, offices, employeeTypes }
                }
              } = data;
              return (
                <Flex mx={-3}>
                  <Box width={250} mx={3}>
                    <Filter
                      location={location}
                      title="Office"
                      name="office"
                      allLabel="All Offices"
                      choices={offices.map(d => ({
                        id: d.id,
                        value: d.name,
                        count: d.numPeople
                      }))}
                    />
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
                  </Box>
                  <Box flex="1" mx={3}>
                    <PeopleList users={results} columns={columns} />
                  </Box>
                </Flex>
              );
            }}
          </Query>
        </Content>
      </Layout>
    );
  }
}
