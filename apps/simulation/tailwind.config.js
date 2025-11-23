/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef8ff',
          100: '#d8eeff',
          200: '#b9e1ff',
          300: '#89cfff',
          400: '#52b4ff',
          500: '#2a93ff',
          600: '#1473f5',
          700: '#0d5ce1',
          800: '#114bb6',
          900: '#14428f',
        },
        people: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309',
        },
        planet: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#047857',
        },
        profit: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
};
