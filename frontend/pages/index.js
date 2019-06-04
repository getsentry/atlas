import { connect } from "react-redux";
import Link from "next/link";

import initialize from "../utils/initialize";
import Layout from "../components/Layout";

const Index = () => (
  <Layout title="Home">
    <h1>Welcome to Atlas</h1>
    <p>Atlas is your map to Sentry.</p>
    <p>
      We could probably put the newest hires here? Anniversaries? Birthdays?
    </p>
    <h2>Explore</h2>
    <p>
      Here are some pages CKJ needs to figure out where to place links to...
    </p>
    <ul>
      <li>
        <Link prefetch href="/people">
          <a>/people</a>
        </Link>
      </li>
      <li>
        <Link prefetch href="/offices">
          <a>/offices</a>
        </Link>
      </li>
      <li>
        <Link prefetch href="/orgChart">
          <a>/orgChart</a>
        </Link>
      </li>
    </ul>
  </Layout>
);

Index.getInitialProps = function(ctx) {
  initialize(ctx);
};

export default connect(state => state)(Index);
