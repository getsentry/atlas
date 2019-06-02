import React from "react";
import Head from "next/head";
import Header from "./header";

import colors from "../colors";

const Layout = props => (
  <React.Fragment>
    <Head>
      <title>Atlas</title>
    </Head>
    <style jsx global>{`
      @font-face {
        font-family: "Rubik";
        font-weight: 400;
        src: url("/static/fonts/Rubik-Regular.ttf") format("truetype");
      }
      @font-face {
        font-family: "Rubik";
        src: asset-url("/static/fonts/Rubik-Italic.ttf") format("truetype");
        font-weight: 400;
        font-style: italic;
      }
      @font-face {
        font-family: "Rubik";
        font-weight: 500;
        src: url("/static/fonts/Rubik-Medium.ttf") format("truetype");
      }
      @font-face {
        font-family: "Rubik";
        font-weight: 700;
        src: url("/static/fonts/Rubik-Bold.ttf") format("truetype");
      }
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        color: #333;
        font-family: "Rubik", -apple-system, BlinkMacSystemFont, "Segoe UI",
          Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji",
          "Segoe UI Emoji", "Segoe UI Symbol";
        font-size: 0.95rem;
      }
      p {
        line-height: 1.8;
      }
      small {
        font-size: 85%;
      }
      pre,
      code {
        font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
          monospace;
      }
      a {
        color: ${colors.primary};
        text-decoration: none;
      }
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-bottom: 1rem;
      }
      h1 {
        font-size: 2em;
        margin-bottom: 0;
        margin-top: 0;
      }
      h2 {
        font-size: 1.5em;
        margin-top: 3rem;
      }
      h3 {
        font-size: 1.125em;
      }
      h4 {
        font-size: 1.075em;
      }
      h5,
      h6 {
        font-size: 1em;
      }
      .container {
        max-width: 65rem;
        margin: 1.5rem auto;
        padding-left: 1rem;
        padding-right: 1rem;
      }
    `}</style>
    <div className="container">
      <Header />
      <main>{props.children}</main>
    </div>
  </React.Fragment>
);

export default Layout;
