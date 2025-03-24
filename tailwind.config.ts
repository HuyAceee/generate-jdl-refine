import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          base: '##31B44A',
          light: '#F6FAFE',
          disabled: '#949DC0',
        },
        secondary: {
          orange: '#FFC9AD',
          purple: '#5F37FF',
          blue: '#E3F7FF',
          green: '#E4FBEE',
          yellow: '#FFE1A6',
          red: '#FF9090',
        },
        neutral: {
          800: '#141414',
          700: '#23262F',
          600: '#353945',
          500: '#777E90',
          400: '#B1B5C3',
          300: '#E6E8EC',
        },
        green: {
          50: '#E8F7EB',
          100: '#C8ECCF',
          200: '#A5E0B3',
          300: '#79D495',
          400: '#4DC877',
          500: '#31B44A', // Base color
          600: '#27953D',
          700: '#1E7630',
          800: '#155623',
          900: '#0D3A17',
          950: '#07220E',
        },
        status: {
          orange: '#E48900',
          red: '#E53A22',
          green: '#3C9F19',
          blue: '#2A85FF',
        },
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          md: '1024px',
          lg: '1280px',
          xl: '1440px',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
};
export default config;
