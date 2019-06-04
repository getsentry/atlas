import React from "react";

import colors from "../colors";

export default () => (
  <React.Fragment>
    <style jsx>
      {`
        section {
          font-size: 16px;
          font-family: "Monaco", sans-serif;
          -webkit-font-smoothing: antialiased;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          text-align: center;
        }

        .main,
        .small {
          margin-bottom: 1.5rem;
        }

        .small {
          font-size: 80%;
        }

        .sk-cube-grid {
          width: 40px;
          height: 40px;
          margin: 20px auto;
        }

        .sk-cube-grid .sk-cube {
          width: 33%;
          height: 33%;
          background-color: ${colors.primary};
          float: left;
          -webkit-animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
          animation: sk-cubeGridScaleDelay 1.3s infinite ease-in-out;
        }

        .sk-cube-grid .sk-cube1 {
          -webkit-animation-delay: 0.2s;
          animation-delay: 0.2s;
        }

        .sk-cube-grid .sk-cube2 {
          -webkit-animation-delay: 0.3s;
          animation-delay: 0.3s;
        }

        .sk-cube-grid .sk-cube3 {
          -webkit-animation-delay: 0.4s;
          animation-delay: 0.4s;
        }

        .sk-cube-grid .sk-cube4 {
          -webkit-animation-delay: 0.1s;
          animation-delay: 0.1s;
        }

        .sk-cube-grid .sk-cube5 {
          -webkit-animation-delay: 0.2s;
          animation-delay: 0.2s;
        }

        .sk-cube-grid .sk-cube6 {
          -webkit-animation-delay: 0.3s;
          animation-delay: 0.3s;
        }

        .sk-cube-grid .sk-cube7 {
          -webkit-animation-delay: 0s;
          animation-delay: 0s;
        }

        .sk-cube-grid .sk-cube8 {
          -webkit-animation-delay: 0.1s;
          animation-delay: 0.1s;
        }

        .sk-cube-grid .sk-cube9 {
          -webkit-animation-delay: 0.2s;
          animation-delay: 0.2s;
        }

        @-webkit-keyframes sk-cubeGridScaleDelay {
          0%,
          70%,
          100% {
            -webkit-transform: scale3D(1, 1, 1);
            transform: scale3D(1, 1, 1);
          }
          35% {
            -webkit-transform: scale3D(0, 0, 1);
            transform: scale3D(0, 0, 1);
          }
        }

        @keyframes sk-cubeGridScaleDelay {
          0%,
          70%,
          100% {
            -webkit-transform: scale3D(1, 1, 1);
            transform: scale3D(1, 1, 1);
          }
          35% {
            -webkit-transform: scale3D(0, 0, 1);
            transform: scale3D(0, 0, 1);
          }
        }

        .react-loading {
          flex: 1;
        }
      `}
    </style>
    <section>
      <div className="react-loading">
        <div className="main">
          Please wait while we load an obnoxious amount of JavaScript.
        </div>
        <div className="small">
          You may need to disable adblocking extensions to run this app.
        </div>
        <div className="sk-cube-grid">
          <div className="sk-cube sk-cube1" />
          <div className="sk-cube sk-cube2" />
          <div className="sk-cube sk-cube3" />
          <div className="sk-cube sk-cube4" />
          <div className="sk-cube sk-cube5" />
          <div className="sk-cube sk-cube6" />
          <div className="sk-cube sk-cube7" />
          <div className="sk-cube sk-cube8" />
          <div className="sk-cube sk-cube9" />
        </div>
      </div>
    </section>
  </React.Fragment>
);
