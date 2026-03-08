/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2D6A4F",
        sidebar: "#1B4332",
        accent: "#52B788",
      },
    },
  },
  plugins: [],
};
