import React, { Component } from "react";
import Link from "next/link";

export default function({ user }) {
  if (!user) return <em>n/a</em>;
  return (
    <article>
      <img src={user.profile.photoUrl} />
      <aside>
        <h4>
          <Link
            href={{ pathname: "/person", query: { id: user.id } }}
            as={`/people/${user.id}`}
          >
            <a>{user.name}</a>
          </Link>
        </h4>
        {user.profile && user.profile.title && (
          <small>{user.profile.title}</small>
        )}
      </aside>
      <style jsx>{`
        article {
          display: flex;
          align-items: center;
        }
        h4 {
          margin-bottom: 0;
          margin-top: 0;
        }
        img {
          display: inline-block;
          width: 32px;
          height: 32px;
          margin-right: 5px;
        }
        aside {
          flex-grow: 1;
          display: inline-block;
        }
      `}</style>
    </article>
  );
}
