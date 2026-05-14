/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B4513',
        secondary: '#D2691E',
        accent: '#F4A460',
        ancient: '#F5DEB3',
        dark: '#2C1810',
      },
      fontFamily: {
        kai: ['KaiTi', 'STKaiti', 'serif'],
      },
    },
  },
  plugins: [],
}
