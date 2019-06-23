import React from "react";
import styled from "@emotion/styled";

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

export default ({ people }) => (
  <PersonListContainer>
    <ul>
      {people.map(p => (
        <li key={p.id}>
          <PersonLink user={p} />
        </li>
      ))}
    </ul>
  </PersonListContainer>
);
