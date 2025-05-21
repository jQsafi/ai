/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        text: 'var(--text)'
      },
      fontFamily: {
        'google-sans': ['Google Sans', 'sans-serif'],
        'roboto': ['Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}