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
      // Also add location-specific palettes for Mustang and Muktinath.
      // - `mustang` maps to a warm rose palette (desert / sunrise tones)
      // - `muktinath` maps to a golden amber palette (temple / saffron tones)
      colors: {
        primary: colors.emerald,
        mustang: colors.rose,
        muktinath: colors.amber,
      },
    },
  },
  plugins: [],
}
