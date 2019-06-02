import Link from "next/link";
import { withRouter } from "next/router";

import colors from "../colors";

const Header = ({ router: { pathname } }) => (
  <header>
    <Link prefetch href="/">
      <a className={pathname === "/" ? "is-active" : ""}>Home</a>
    </Link>
    <Link prefetch href="/people">
      <a className={pathname.indexOf("/people") === 0 ? "is-active" : ""}>
        People
      </a>
    </Link>
    <style jsx>{`
      header {
        margin-bottom: 1.5rem;
      }
      a {
        font-size: 1.2em;
        margin-right: 15px;
        text-decoration: none;
      }
      .is-active {
        border-bottom: 4px solid ${colors.primary};
      }
    `}</style>
  </header>
);

export default withRouter(Header);
