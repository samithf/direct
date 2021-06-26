import React from "react";
import Head from "next/head";

import "../styles/global.css";

import Page from "../layouts/Page";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Free Video Meetings</title>
      </Head>
      <Page>
        <Component {...pageProps} />
      </Page>
    </>
  );
}

export default MyApp;
