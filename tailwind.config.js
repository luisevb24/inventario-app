/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,ts,jsx,tsx}",
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
          colors: {
            primary: '#002e4e',    // Azul oscuro como color principal
            secondary: '#006c68',  // Verde azulado
            accent: '#e69500',     // Amarillo/naranja como acento
            'light-blue': '#e6f0f8', // Azul claro para fondos
          },
        fontFamily: {
          sans: ['var(--font-satoshi)', 'var(--font-inter)', 'sans-serif'],
          heading: ['var(--font-inter-tight)', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };