/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gen: {
          50: '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          brand: '#3b82f6',
          dark: '#0a0d14',
          card: '#111726',
          border: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
