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
          500: '#0284C7',
          600: '#006699',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
          950: '#082F49',
        },
        sea: {
          DEFAULT: '#1a2d44',
          light: '#243d5e',
          dark: '#0f1e2e',
        },
        // PLV Gold — extracted from the logo's gold lettering
        gold: {
          DEFAULT: '#B8963E',
          light: '#D4AF5A',
          muted: '#C9A84C',
          50:  '#FDF9EE',
          100: '#F8EDCA',
          200: '#F0D88A',
          300: '#E8C055',
          400: '#D4AF5A',
          500: '#B8963E',
          600: '#9C7D2E',
          700: '#7A6020',
          800: '#584516',
          900: '#362A0C',
        },
        navy: {
          DEFAULT: '#1a2d44',
          light: '#243d5e',
          dark: '#0f1e2e',
          50: '#eef2f7',
          100: '#d5dfe8',
          900: '#0f1e2e',
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

