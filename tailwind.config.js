/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nanum Gothic", "sans-serif"],
        medieval: ["MedievalSharp", "serif"],
      },
    },
  },
  plugins: [],
};
