import React, { Component } from "react";
import { Box, Flex } from "@rebass/grid/emotion";
import Card from "../components/Card";
import Content from "../components/Content";
import ErrorMessage from "../components/ErrorMessage";
import Layout from "../components/Layout";
import { LIST_PEOPLE_QUERY } from "../queries";
import apolloClient from "../utils/apollo";
import PeopleViewSelectors from "../components/PeopleViewSelectors";
import QuizCard from "../components/QuizCard";
import { listOfIntegers, reshuffle, shuffle } from "../utils/shuffle";
import { createGame, getUserMap, pickNWeighted, updateGame } from "../utils/quiz";

const OPTION_COUNT = 4;

export default class Quiz extends Component {
  constructor(...params) {
    super(...params);
    this.state = {
      error: null,
      loading: true,
      users: [],
      usersMap: {},
      future: [],
      index: 0,
      sparseMatrix: {},
      options: [],
      answer: {},
      isFlipped: false,
      streak: 0,
      correct: false
    };
  }

  previousOption = () => {
    const { index, isFlipped } = this.state;
    if (isFlipped || index === 0) return;
    this.setState({ index: index - 1 });
  };

  nextOption = () => {
    const { index, isFlipped } = this.state;
    if (isFlipped || index === OPTION_COUNT - 1) return;
    this.setState({ index: index + 1 });
  };

  manuallySelectOption = id => {
    const { isFlipped } = this.state;
    if (isFlipped) return;
    this.setState({ index: id });
  };

  handleEnter = () => {
    const { isFlipped } = this.state;
    if (isFlipped) {
      this.step();
    } else {
      this.guess();
    }
  };

  loadGame = () => {
    const { users, sparseMatrix, future, futureIndex, usersMap } = this.state;

    const answer = users[future[futureIndex]];
    const oddsTable = createGame(users, sparseMatrix);
    const probabilities = oddsTable[answer.id] || {};
    const lures = pickNWeighted(probabilities, OPTION_COUNT - 1);

    const options = lures.map(y => usersMap[y]);
    options.push(answer);

    this.setState({
      answer,
      options: shuffle(options)
    });
  };

  guess = () => {
    const { sparseMatrix, options, answer, index, streak } = this.state;
    const optionIDs = options.map(({ id }) => id);
    const newSparseMatrix = updateGame(
      sparseMatrix,
      optionIDs,
      answer.id,
      options[index].id
    );

    const correct = options[index].id === answer.id;

    this.setState({
      isFlipped: true,
      sparseMatrix: newSparseMatrix,
      correct,
      streak: correct ? streak + 1 : 0
    });
  };

  step = () => {
    const { future, futureIndex } = this.state;

    const nextIndex = (futureIndex + 1) % future.length;
    this.setState({
      future: nextIndex === 0 ? reshuffle(future) : future,
      futureIndex: nextIndex,
      index: 0,
      isFlipped: false,
      correct: false
    });

    this.loadGame();
  };

  loadUsers = () => {
    apolloClient
      .query({
        query: LIST_PEOPLE_QUERY,
        variables: {
          humansOnly: false,
          limit: 1000
        }
      })
      .then(({ error, data }) => {
        if (error) {
          return this.setState({ loading: false, error });
        }

        const users = data.users.results;
        const usersMap = getUserMap(users);
        this.setState({
          loading: false,
          users,
          usersMap,
          future: shuffle(listOfIntegers(users.length)),
          futureIndex: 0
        });

        this.loadGame();
      });
  };

  handleKeys = event => {
    switch (event.keyCode) {
      case 13:
        return this.handleEnter();
      case 38:
        return this.previousOption();
      case 40:
        return this.nextOption();
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
    const {
      answer,
      correct,
      error,
      index,
      isFlipped,
      loading,
      options,
      streak
    } = this.state;

    if (error) return <ErrorMessage message="Error loading quiz." />;
    if (loading) return <React.Fragment />;
    if (!answer) return <ErrorMessage message="No users selected." />;

    return (
      <Layout>
        <Content>
          <Card>
            <Flex mx={-3} alignItems="left">
              <Box width={250} mx={3}>
                <h1>Quiz</h1>
              </Box>
              <PeopleViewSelectors current={"quiz"} />
            </Flex>
          </Card>
          <Card>
            <QuizCard
              person={answer}
              options={options}
              index={index}
              onClick={this.manuallySelectOption}
              isFlipped={isFlipped}
              streak={streak}
              correct={correct}
            />
          </Card>
        </Content>
      </Layout>
    );
  }
}
