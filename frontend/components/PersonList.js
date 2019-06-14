import React from "react";

import PersonLink from "./PersonLink";

export default ({ people }) => (
  <React.Fragment>
    <style jsx>{`
      ul {
        list-style: none;
        padding-left: 0;
      }
      li {
        margin-bottom: 5px;
      }
    `}</style>
    <ul>
      {people.map(p => (
        <li key={p.id}>
          <PersonLink user={p} />
        </li>
      ))}
    </ul>
  </React.Fragment>
);
