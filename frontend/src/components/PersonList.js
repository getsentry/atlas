import React from "react";
import styled from "@emotion/styled";
import { Box } from "@rebass/grid/emotion";
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

const PersonListCardWrapper = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-columns: minmax(200px, 1fr) max-content;
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

export const PersonListCard = ({
  user,
  withAnniversary,
  withBirthday,
  withStartDate
}) => (
  <Card to={`/people/${user.email}`} withPadding noMargin slim>
    <PersonListCardWrapper>
      <Box>
        <PersonLink user={user} noLink />
      </Box>
      {withAnniversary && (
        <Box style={{ textAlign: "right" }}>
          {age(user.dateStarted)}
          <br />
          <small>{fromNowCurrentYear(user.dateStarted)}</small>
        </Box>
      )}
      {withBirthday && user.dobMonth && (
        <Box style={{ textAlign: "right" }}>
          {moment(
            `${new Date().getFullYear()}-${user.dobMonth}-${user.dobDay}`,
            "YYYY-MM-DD"
          ).format("MMMM Do")}
          <br />
          <small>
            {moment(
              `${new Date().getFullYear()}-${user.dobMonth}-${user.dobDay}`,
              "YYYY-MM-DD"
            ).fromNow()}
          </small>
        </Box>
      )}
      {withStartDate && user.dateStarted && (
        <Box style={{ textAlign: "right" }}>
          {moment(user.dateStarted, "YYYY-MM-DD").format("MMMM Do")}
          <br />
          <small>{fromNowCurrentYear(user.dateStarted)}</small>
        </Box>
      )}
    </PersonListCardWrapper>
  </Card>
);

export default ({ people, withAnniversary, withBirthday, withStartDate }) => (
  <PersonListContainer>
    <ul>
      {people.map(p => (
        <li key={p.id}>
          <PersonListCard
            user={p}
            withAnniversary={withAnniversary}
            withBirthday={withBirthday}
            withStartDate={withStartDate}
          />
        </li>
      ))}
    </ul>
  </PersonListContainer>
);
