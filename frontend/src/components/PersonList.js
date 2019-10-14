import React from "react";
import styled from "@emotion/styled";
import { Flex, Box } from "@rebass/grid/emotion";
import moment from "moment";

import Card from "./Card";
import PersonLink from "./PersonLink";

const PersonListContainer = styled.section`
  li {
    display: block;
    margin: 0;
  }
  ul {
    margin: 0 -1rem 0.5rem;
    list-style: none;
    padding: 0;
  }
`;

function age(dateStarted) {
  let years = Math.round(moment().diff(moment(dateStarted), "years", true));
  return `${years} year${years !== 1 ? "s" : ""}`;
}

function fromNowCurrentYear(date) {
  return moment(date, "YYYY-MM-DD")
    .year(moment().year())
    .fromNow();
}

export default ({ people, withAnniversary, withBirthday, withStartDate }) => (
  <PersonListContainer>
    <ul>
      {people.map(p => (
        <li key={p.id}>
          <Card to={`/people/${p.email}`} withPadding noMargin slim>
            <Flex>
              <Box flex="1">
                <PersonLink user={p} />
              </Box>
              {withAnniversary && (
                <Box style={{ textAlign: "right" }}>
                  {age(p.dateStarted)}
                  <br />
                  <small>{fromNowCurrentYear(p.dateStarted)}</small>
                </Box>
              )}
              {withBirthday &&
                (p.dobMonth && (
                  <Box style={{ textAlign: "right" }}>
                    {moment(
                      `${new Date().getFullYear()}-${p.dobMonth}-${p.dobDay}`,
                      "YYYY-MM-DD"
                    ).format("MMMM Do")}
                    <br />
                    <small>
                      {moment(
                        `${new Date().getFullYear()}-${p.dobMonth}-${p.dobDay}`,
                        "YYYY-MM-DD"
                      ).fromNow()}
                    </small>
                  </Box>
                ))}
              {withStartDate &&
                (p.dateStarted && (
                  <Box style={{ textAlign: "right" }}>
                    {moment(p.dateStarted, "YYYY-MM-DD").format("MMMM Do")}
                    <br />
                    <small>{fromNowCurrentYear(p.dateStarted)}</small>
                  </Box>
                ))}
            </Flex>
          </Card>
        </li>
      ))}
    </ul>
  </PersonListContainer>
);
