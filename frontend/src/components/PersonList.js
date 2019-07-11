import React from "react";
import styled from "@emotion/styled";
import { Flex, Box } from "@rebass/grid/emotion";
import moment from "moment";

import PersonLink from "./PersonLink";

const PersonListContainer = styled.section`
  li {
    display: block;
    margin-bottom: 1rem;
  }
  ul {
    margin: 1rem 0;
    padding: 0;
  }
`;

export default ({ people, withBirthday, withStartDate }) => (
  <PersonListContainer>
    <ul>
      {people.map(p => (
        <li key={p.id}>
          <Flex>
            <Box flex="1">
              <PersonLink user={p} />
            </Box>
            {withBirthday &&
              (p.profile.dobMonth && (
                <Box>
                  {moment(
                    `${new Date().getFullYear()}-${p.profile.dobMonth}-${
                      p.profile.dobDay
                    }`,
                    "YYYY-MM-DD"
                  ).format("MMMM Do")}
                </Box>
              ))}
            {withStartDate &&
              (p.profile.dateStarted && (
                <Box>{moment(p.profile.dateStarted, "YYYY-MM-DD").format("MMMM Do")}</Box>
              ))}
          </Flex>
        </li>
      ))}
    </ul>
  </PersonListContainer>
);
