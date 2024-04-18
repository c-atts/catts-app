/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Inter", "Sans-serif"],
    },
    extend: {
      colors: {
        "theme-950": "#3A5334",
        "theme-900": "#516742",
        "theme-800": "#6A7B50",
        "theme-700": "#868F5E",
        "theme-600": "#a2a06c",
        "theme-500": "#AFA47F",
        "theme-400": "#BCAB92",
        "theme-300": "#C9B4A5",
        "theme-200": "#D5BFB9",
        "theme-100": "#E2CDCD",
        "theme-50": "#EEE1E3",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
