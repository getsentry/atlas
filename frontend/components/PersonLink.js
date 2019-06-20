import React from "react";
import Link from "next/link";
import Avatar from "react-avatar";

export default function({ user }) {
  if (!user) return <em>n/a</em>;
  return (
    <article>
      <div className="avatar">
        {user.profile.photoUrl ? (
          <img src={user.profile.photoUrl} />
        ) : (
          <Avatar name={user.name} size="32" />
        )}
      </div>
      <aside>
        <h4>
          <Link
            href={{ pathname: "/person", query: { id: user.id } }}
            as={`/people/${user.id}`}
          >
            <a>{user.name}</a>
          </Link>
        </h4>

        {user.profile.title && <small>{user.profile.title}</small>}
      </aside>
      <style jsx>{`
        article {
          display: flex;
          align-items: center;
          overflow: hidden;
        }
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
      `}</style>
    </article>
  );
}
