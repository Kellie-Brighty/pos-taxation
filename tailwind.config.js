/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        dmsans: ["DM Sans", "sans-serif"],
      },
      colors: {
        primary: "#0066FF",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assets/hero-pattern.svg')",
      },
    },
  },
  plugins: [],
};
