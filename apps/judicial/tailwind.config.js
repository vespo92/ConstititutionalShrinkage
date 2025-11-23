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
        judicial: {
          primary: '#1e3a5f',      // Deep blue - authority, trust
          secondary: '#d4af37',    // Gold - justice, importance
          dark: '#0f172a',         // Navy for backgrounds
          light: '#f8fafc',        // Light background
        },
        compliance: {
          compliant: '#10b981',    // Green - good
          warning: '#f59e0b',      // Yellow/amber - warning
          violation: '#ef4444',    // Red - violation
        },
        severity: {
          minor: '#fbbf24',        // Amber
          major: '#f97316',        // Orange
          critical: '#dc2626',     // Red
        },
      },
      fontFamily: {
        sans: ['Inter var', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        legal: ['Georgia', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
