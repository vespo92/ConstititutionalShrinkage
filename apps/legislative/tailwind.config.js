/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gov-blue': '#1a365d',
        'gov-gold': '#d69e2e',
        'bill-draft': '#ecc94b',
        'bill-proposed': '#4299e1',
        'bill-voting': '#9f7aea',
        'bill-active': '#48bb78',
        'bill-sunset': '#ed8936',
        'bill-repealed': '#f56565',
      },
    },
  },
  plugins: [],
};
