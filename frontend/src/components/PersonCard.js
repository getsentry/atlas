import React from "react";
import Avatar from "react-avatar";
import styled from "@emotion/styled";

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
  .avatar {
    display: inline-block;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin-bottom: 0.5em;
  }
  .avatar img,
  .avatar .sb-avatar,
  .avatar .sb-avatar > div {
    max-width: 100%;
    max-height: 100%;
    border-radius: 50%;
  }
  aside {
    overflow: hidden;
  }
  small {
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
      <div className="avatar">
        {user.profile.photoUrl ? (
          <img src={user.profile.photoUrl} alt="" />
        ) : (
          <Avatar name={user.name} size="64" />
        )}
      </div>
      <aside>
        <h4>{user.name}</h4>

        {user.profile.title && <small>{user.profile.title}</small>}
      </aside>
    </PersonCardContainer>
  );
}
