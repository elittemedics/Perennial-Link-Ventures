/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0284C7', // Sea Blue primary
          600: '#006699', // Rich Sea Blue
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        sea: {
          DEFAULT: '#006699',
          light: '#0284C7',
          dark: '#0A4B70',
        },
        slate: {
          light: '#F8FAFC',
          muted: '#E2E8F0',
          grey: '#64748B',
          dark: '#1E293B',
        }
      },
    },
  },
  plugins: [],
};
