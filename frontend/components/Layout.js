import React from "react";
import Head from "next/head";
import Header from "./header";

const Layout = props => (
  <React.Fragment>
    <Head>
      <title>Atlas</title>
    </Head>
    <style jsx global>{`
      @font-face {
        font-family: "Rubik";
        font-weight: 400;
        src: url("/static/fonts/Rubik-Regular.ttf") format("ttf");
      }
      @font-face {
        font-family: "Rubik";
        font-weight: bold;
        src: url("/static/fonts/Rubik-Bold.ttf") format("ttf");
      }
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        color: #333;
        font-family: "Rubik", sans-serif;
      }
      .container {
        max-width: 65rem;
        margin: 1.5rem auto;
        padding-left: 1rem;
        padding-right: 1rem;
      }
    `}</style>
    <Header />

    <main>
      <div className="container">{props.children}</div>
    </main>
  </React.Fragment>
);

export default Layout;
