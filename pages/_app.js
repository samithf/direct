import React from "react";
import "../styles/global.css";

import Page from "../layouts/Page";

function MyApp({ Component, pageProps }) {
  return (
    <Page>
      <Component {...pageProps} />
    </Page>
  );
}

export default MyApp;
