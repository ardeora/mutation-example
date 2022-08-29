/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          background: '#12161E',
          foreground: '#191E2A',
          lightGray: '#2C3748'

        }
      }
    },
  },
  plugins: [],
}