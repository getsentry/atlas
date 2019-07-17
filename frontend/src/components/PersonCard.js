import React from "react";
import styled from "@emotion/styled";

import Avatar from "./Avatar";
import Card from "./Card";

const PersonCardContainer = styled(Card)`
  overflow: hidden;
  text-align: center;

  h4 {
    margin-bottom: 0;
    margin-top: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  aside {
    overflow: hidden;
  }
  small {
    height: 1.2em;
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default function({ user }) {
  if (!user) return <em>n/a</em>;
  return (
    <PersonCardContainer withPadding to={`/people/${user.email}`}>
      <Avatar user={user} size={64} mb />
      <aside>
        <h4>{user.name}</h4>

        <small>{user.title || ""}</small>
      </aside>
    </PersonCardContainer>
  );
}
