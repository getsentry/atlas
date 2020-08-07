import React from "react";
import { Flex, Box } from "@rebass/grid/emotion";
import Content from "./Content";
import Avatar from "./Avatar";
import Card from "./Card";
import colors from "../colors";
import ReactCardFlip from "react-card-flip";

export default function QuizCard(props) {
  const style = {
    background: colors.cardBackgroundHover,
    width: "300px",
    height: "300px",
    margin: "0 10px",
  };

  const { index, onClick, options, person, isFlipped, streak, correct } = props;

  return (
    <Content>
      <Flex style={{ justifyContent: "center" }}>
        <Box>
          <ReactCardFlip flipDirection={"vertical"} isFlipped={isFlipped}>
            <Card style={style}>
              <section className="meta">
                <div className="photo">
                  <Avatar user={person} />
                </div>
              </section>
            </Card>
            <Card style={style}>
              <section className="meta">
                <div
                  className="section"
                  style={{ display: isFlipped ? "block" : "none" }}
                >
                  <h1 data-testid="name">{person.name}</h1>
                  {person.handle && person.handle !== person.name && (
                    <h2>"{person.handle}"</h2>
                  )}
                  <h4>{person.title}</h4>
                  {person.employeeType &&
                    person.employeeType.name &&
                    person.employeeType.id !== "FULL_TIME" && (
                      <h4>({person.employeeType.name})</h4>
                    )}
                  {correct ? (
                    <h2 style={{ color: colors.green }}>Correct!</h2>
                  ) : (
                    <h4 style={{ color: colors.red }}>Wrong Answer.</h4>
                  )}
                  {streak ? <h4>Streak: {streak}</h4> : <React.Fragment />}
                  <h4>Hit Enter to Continue.</h4>
                </div>
                <div className="section">
                  <div className="item">{person.pronouns}</div>
                </div>
              </section>
            </Card>
          </ReactCardFlip>
        </Box>
        <Box>
          <Card style={style}>
            <section className="meta">
              <div className="section">
                {options.map(({ id, name }, i) => {
                  const background = i === index ? colors.cardBackground : "inherit";
                  return (
                    <h2 style={{ background }} onClick={() => onClick(i)}>
                      {name}
                    </h2>
                  );
                })}
              </div>
            </section>
          </Card>
        </Box>
      </Flex>
    </Content>
  );
}
