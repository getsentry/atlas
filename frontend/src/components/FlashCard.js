import React from "react";
import ReactCardFlip from "react-card-flip";
import Content from "./Content";
import Avatar from "./Avatar";
import Card from "./Card";
import colors from "../colors";

export default function FlashCard(props) {
  const { person, isFlipped } = props;

  const style = {
    background: colors.cardBackgroundHover,
    width: "300px",
    height: "300px",
    margin: "0 auto"
  };

  return (
    <Content>
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
            <div className="section" style={{ display: isFlipped ? "block" : "none" }}>
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
            </div>
            <div className="section">
              <div className="item">{person.pronouns}</div>
            </div>
          </section>
        </Card>
      </ReactCardFlip>
    </Content>
  );
}
