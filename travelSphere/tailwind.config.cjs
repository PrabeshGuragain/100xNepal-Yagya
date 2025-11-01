const colors = require('tailwindcss/colors')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
  ],
  theme: {
    extend: {
      // Use Tailwind's emerald palette as the project's "primary"
      colors: {
        primary: colors.emerald,
      },
    },
  },
  plugins: [],
}
