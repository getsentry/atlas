import React from "react";
import styled from "@emotion/styled";
import { css } from "@emotion/core";

import Avatar from "./Avatar";
import Card from "./Card";

const PersonCardContainer = styled(Card)(
  (props) => css`
    ${props.horizontal &&
    `
  display: inline-block;
  `}

    a {
      overflow: hidden;
      ${props.horizontal
        ? `
    display: flex;
    align-items: center;
  `
        : `
  text-align: center;
  `}
    }

    img {
      display: block;
      max-width: 100%;
      max-height: 100%;
    }

    aside {
      overflow: hidden;
      ${props.horizontal &&
      `
      flex-grow: 1;
      display: inline-block;
    `}
      h4 {
        margin-bottom: 0;
        margin-top: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      small {
        height: 1.2em;
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  `
);

export default function ({ user, ...props }) {
  if (!user) return <em>n/a</em>;
  let avatarProps = props.horizontal ? { mr: "5px" } : { mb: true };
  return (
    <PersonCardContainer withPadding to={`/people/${user.email}`} {...props}>
      <Avatar user={user} size={props.horizontal ? 32 : 64} {...avatarProps} />
      <aside>
        <h4>{user.name}</h4>

        <small>{user.title || ""}</small>
      </aside>
    </PersonCardContainer>
  );
}
