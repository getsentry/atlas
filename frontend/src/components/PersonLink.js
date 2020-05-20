import React from "react";
import { Link } from "react-router";
import styled from "@emotion/styled";

import Avatar from "./Avatar";

const PersonLinkContainer = styled.article`
  display: flex;
  align-items: center;
  overflow: hidden;

  h4 {
    margin-bottom: 0;
    margin-top: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  img {
    display: block;
    max-width: 100%;
    max-height: 100%;
  }
  aside {
    flex-grow: 1;
    display: inline-block;
    overflow: hidden;
  }
  small {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export default function({ className, user, avatarSize = 32, noLink = false }) {
  if (!user) return <em className={className}>n/a</em>;
  return (
    <PersonLinkContainer className={className}>
      <Avatar user={user} size={avatarSize} mr="5px" />
      <aside>
        <h4>
          {noLink ? user.name : <Link to={`/people/${user.email}`}>{user.name}</Link>}
        </h4>

        {user.title && <small>{user.title}</small>}
      </aside>
    </PersonLinkContainer>
  );
}
