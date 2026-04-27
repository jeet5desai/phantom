import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F6F3',
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F0EFEb',
        },
        text: {
          primary: '#1A1A1A',
          secondary: '#6B6860',
          tertiary: '#A3A199',
        },
        accent: {
          primary: '#E07A3A',
          light: '#FDF0E6',
          dark: '#B85E22',
        },
        success: {
          DEFAULT: '#2D7D46',
          bg: '#F0FDF4',
        },
        error: {
          DEFAULT: '#E53E3E',
          bg: '#FFF5F5',
        },
        warning: {
          DEFAULT: '#D97706',
          bg: '#FFFBEB',
        },
        border: {
          DEFAULT: '#E8E6E0',
          strong: '#C8C5BD',
        },
        overlay: 'rgba(0,0,0,0.4)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
      borderRadius: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
    },
  },
  plugins: [],
};
export default config;
