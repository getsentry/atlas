import React from "react";
import styled from "@emotion/styled";
import { Avatar as ReactAvatar } from "react-avatar";

export default styled(({ className, user, size }) => {
  return (
    <div className={className}>
      {!!user.photo.data ? (
        <img src={`data:${user.photo.mimeType};base64,${user.photo.data}`} alt="" />
      ) : (
        <ReactAvatar name={user.name} size={size} />
      )}
    </div>
  );
})`
  display: inline-block;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin-right ${props => (props.mr ? (props.mr !== true ? props.mr : "0.5rem") : "0")};

  img,
  .sb-avatar,
  .sb-avatar > div {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }
`;
