/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: '#e69500',     // Naranja/ámbar
        secondary: '#006c68',   // Verde azulado
        tertiary: '#002e4e',    // Azul marino
        accent: '#e69500',      // Amarillo/naranja como acento
        'light-blue': '#e6f0f8', // Azul claro para fondos
        'bg-beige': '#faf6f3',  // Beige del manual de marca
        'table-gray': {
          light: '#f3f4f6',
          medium: '#97a5a5',
          dark: '#153846',
          darker: '#052a30',
        },
        background: {
          dark: '#006c68',
          light: '#faf6f3',
        }
      },
      fontFamily: {
        sans: ['var(--font-satoshi)', 'var(--font-inter)', 'sans-serif'],
        heading: ['var(--font-inter-tight)', 'sans-serif'],
        satoshi: ['var(--font-satoshi)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
