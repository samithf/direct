import "../styles/global.css";
import { Head } from "next/document";

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
