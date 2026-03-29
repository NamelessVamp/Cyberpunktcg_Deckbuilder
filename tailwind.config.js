/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'term-black': '#0a0a0a',
        'term-gray': '#1a1a1a',
        'term-gray-light': '#2a2a2a',
        'term-amber': '#ffb300',
        'term-green': '#00ff41',
        'term-red': '#ff1744',
        'term-blue': '#00e5ff',
      },
      fontFamily: {
        mono: ['"Fira Code"', 'monospace'],
      },
    },
  },
  plugins: [],
}