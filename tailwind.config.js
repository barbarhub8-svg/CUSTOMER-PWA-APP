/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'outfit': ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#2563eb',
        'primary-dark': '#1e3a8a',
        secondary: '#6d28d9',
        accent: '#3b82f6',
      }
    },
  },
  plugins: [],
}
