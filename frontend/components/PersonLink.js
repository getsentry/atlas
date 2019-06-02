import React, { Component } from "react";
import Link from "next/link";

export default function({ user }) {
  if (!user) return <em>n/a</em>;
  return (
    <div>
      <h4>
        <Link
          href={{ pathname: "/person", query: { id: user.id } }}
          as={`/people/${user.id}`}
        >
          <a>{user.name}</a>
        </Link>
      </h4>
      <small>{user.profile.title}</small>
      <style jsx>{`
        h4 {
          margin-bottom: 0;
          margin-top: 0;
        }
      `}</style>
    </div>
  );
}
