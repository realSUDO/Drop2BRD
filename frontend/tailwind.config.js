/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: '#1E1E1E',
        surface: '#272727',
        border: '#383838',
        card: '#3F3F3F',
        'card-alt': '#282828',
        'input-fill': '#282828',
        'input-border': '#454545',
        'btn-primary': '#1188FF',
        'nav-active': '#4A5878',
        muted: '#787878',
        'muted-light': '#909090',
        'muted-lighter': '#B4B4B4',
        'panel': '#353535',
      },
      borderRadius: {
        'figma': '8px',
        'figma-lg': '12px',
        'pill': '38px',
      },
      spacing: {
        '18': '18px',
        '24': '24px',
        '309': '309px',
      },
    },
  },
  plugins: [],
}
