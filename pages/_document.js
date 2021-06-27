import Document, { Html, Main, Head, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html className="h-full">
        <Head>
          <title>Free Video Meetings</title>
        </Head>
        <body className="bg-white text-gray-700 h-full w-full bg-landing bg-bottom bg-130% bg-no-repeat lg:bg-50% lg:bg-right">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
