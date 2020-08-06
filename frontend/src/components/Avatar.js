import React from "react";
import styled from "@emotion/styled";
import ReactAvatar from "react-avatar";

export default styled(({ className, user, size }) => {
  return (
    <div className={className}>
      {user.photo && !!user.photo.data ? (
        <img
          src={`data:${user.photo.mimeType};base64,${user.photo.data}`}
          alt=""
          width={size}
          height={size}
        />
      ) : (
        <ReactAvatar name={user.name} size={size} />
      )}
    </div>
  );
})`
  display: block;
  margin: 0 auto;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin-right: ${props =>
    props.mr ? (props.mr !== true ? props.mr : "0.5rem") : "auto"};
  margin-bottom: ${props => (props.mb ? (props.mb !== true ? props.mb : "0.5rem") : "0")};
  flex-shrink: 0;

  img,
  .sb-avatar,
  .sb-avatar > div {
    border-radius: 50%;
    width: 100%;
    height: 100%;
  }
`;
