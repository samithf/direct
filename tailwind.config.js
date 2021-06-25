module.exports = {
  mode: "jit",
  purge: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: (theme) => ({
        user: "url('/user.svg')",
        landing: "url('/landing.jpg')",
      }),
      backgroundSize: {
        auto: "auto",
        cover: "cover",
        contain: "contain",
        "50%": "50%",
        "25%": "25%",
        "130%": "130%",
        16: "4rem",
      },
      width: {
        500: "500px",
        300: "300px",
      },
      height: {
        500: "500px",
        300: "300px",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
