import React from "react";

export default ({ children }) => {
  return (
    <section>
      {children}
      <style jsx>{`
        section {
          background: #fff;
          padding: 10px 20px;
        }
      `}</style>
    </section>
  );
};
