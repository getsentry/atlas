import React from "react";
import { Link } from "react-router";
import Avatar from "react-avatar";
import styled from "@emotion/styled";

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
  .avatar {
    display: inline-block;
    width: 32px;
    height: 32px;
    margin-right: 5px;
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

export default function({ user }) {
  if (!user) return <em>n/a</em>;
  return (
    <PersonLinkContainer>
      <div className="avatar">
        {user.profile.photoUrl ? (
          <img src={user.profile.photoUrl} alt="" />
        ) : (
          <Avatar name={user.name} size="32" />
        )}
      </div>
      <aside>
        <h4>
          <Link to={`/people/${user.email}`}>{user.name}</Link>
        </h4>

        {user.profile.title && <small>{user.profile.title}</small>}
      </aside>
    </PersonLinkContainer>
  );
}
