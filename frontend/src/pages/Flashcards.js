import React, { Component } from "react";
import { Box, Flex } from "@rebass/grid/emotion";
import Card from "../components/Card";
import Content from "../components/Content";
import ErrorMessage from "../components/ErrorMessage";
import FlashCard from "../components/FlashCard";
import Layout from "../components/Layout";
import { LIST_PEOPLE_QUERY } from "../queries";
import apolloClient from "../utils/apollo";
import PeopleViewSelectors from "../components/PeopleViewSelectors";
import { listOfIntegers, reshuffle, shuffle } from "../utils/shuffle";

// TODO carousel animation
const DISPLAY_COUNT = 5;

export default class Flashcards extends Component {
  constructor(...params) {
    super(...params);
    this.state = {
      error: null,
      loading: true,
      isFlipped: false,
      users: [],
      history: [],
      future: [],
      futureIndex: 0,
    };
  }

  previousCard = () => {
    const { future, history } = this.state;

    // If there is no history, do nothing.
    if (history.length <= DISPLAY_COUNT) return;

    history.pop();

    this.setState({
      history,
      futureIndex: 0,
      future: shuffle(listOfIntegers(future.length)),
      isFlipped: false,
    });
  };

  nextCard = () => {
    const { future, history, futureIndex } = this.state;
    history.push(future[futureIndex]);

    const nextIndex = futureIndex + 1;
    if (nextIndex === future.length) {
      return this.setState({
        futureIndex: 0,
        future: reshuffle(future),
        history,
        isFlipped: false,
      });
    }

    this.setState({
      history,
      futureIndex: nextIndex,
      isFlipped: false,
    });
  };

  flipIt = () => {
    this.setState({ isFlipped: !this.state.isFlipped });
  };

  loadUsers = () => {
    apolloClient
      .query({
        query: LIST_PEOPLE_QUERY,
        variables: {
          humansOnly: false,
          limit: 1000,
        },
      })
      .then(({ error, data }) => {
        if (error) {
          return this.setState({ loading: false, error });
        }

        const users = data.users.results;
        const future = shuffle(listOfIntegers(users.length));
        const futureIndex = Math.min(DISPLAY_COUNT, future.length) - 1;
        this.setState({
          loading: false,
          users,
          future,
          futureIndex,
          history: future.slice(0, futureIndex + 1),
        });
      });
  };

  handleKeys = (event) => {
    switch (event.keyCode) {
      case 37:
        return this.previousCard();
      case 38:
        return this.flipIt();
      case 39:
        return this.nextCard();
      default:
    }
  };

  componentDidMount() {
    document.addEventListener("keyup", this.handleKeys, false);
    this.loadUsers();
  }

  componentWillUnmount() {
    document.removeEventListener("keyup", this.handleKeys, false);
  }

  render() {
    const { error, history, isFlipped, loading, users } = this.state;

    if (error) return <ErrorMessage message="Error loading flashcards." />;
    if (loading) return <React.Fragment />;
    if (!users.length) return <ErrorMessage message="No users selected." />;

    return (
      <Layout>
        <Content>
          <Card>
            <Flex mx={-3} alignItems="left">
              <Box width={250} mx={3}>
                <h1>Flashcards</h1>
              </Box>
              <PeopleViewSelectors current={"flashcards"} />
            </Flex>
          </Card>
          <Card>
            <Flex style={{ overflowX: "hidden" }}>
              {listOfIntegers(DISPLAY_COUNT).map((i) => {
                return (
                  <FlashCard
                    person={users[history.slice(i - DISPLAY_COUNT)[0]]}
                    isFlipped={i === Math.floor(DISPLAY_COUNT / 2) ? isFlipped : false}
                  />
                );
              })}
            </Flex>
          </Card>
        </Content>
      </Layout>
    );
  }
}
