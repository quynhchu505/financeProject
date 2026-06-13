/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F35B16',
          hover: '#FF692D',
        },
        charcoal: {
          DEFAULT: '#22201D',
        },
        beige: {
          light: '#FFE9DE',
          medium: '#FFD7C4',
          strong: '#FFC9B1',
        },
        gray: {
          dark: '#777573',
          medium: '#CCCCCC',
          border: '#DCD9D6',
        },
        offwhite: {
          1: '#FEFCFB',
          2: '#F6F5F3',
          3: '#EFECEA',
        },
        semantic: {
          warning: '#FFBC0B',
          'warning-hover': '#FFC53D',
          error: '#D64700',
        },
        income: '#2a9d8f',
        expense: '#e76f51',
      },
      fontFamily: {
        display: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
        ui: ['Outfit', 'Helvetica Neue', 'Arial', 'sans-serif'],
        utility: ['Helvetica', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'raised': '0px 1px 2px 0px rgba(34, 32, 29, 0.05)',
        'elevated': '0px 10px 15px -3px rgba(34, 32, 29, 0.1), 0px 4px 6px -4px rgba(34, 32, 29, 0.1)',
        'high': '0px 0px 0px 0px rgb(255, 255, 255), 0px 0px 0px 1px rgba(34, 32, 27, 0.075), 0px 20px 25px -5px rgba(34, 32, 29, 0.1), 0px 8px 10px -6px rgba(34, 32, 29, 0.1)',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '40px',
        '4xl': '48px',
        '5xl': '64px',
        '6xl': '80px',
        '7xl': '96px',
      },
      borderRadius: {
        'subtle': '4px',
        'standard': '8px',
        'card': '12px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
