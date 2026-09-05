/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: '#16321f',
        forestDeep: '#0e2216',
        moss: '#4b6b3b',
        gold: '#b8934a',
        goldLight: '#e3c98a',
        cream: '#f6f1e4',
        ivory: '#fffdf8',
        ink: '#26261f',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['"Jost"', 'sans-serif'],
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 26s linear infinite',
      },
      boxShadow: {
        brand: '0 20px 45px -25px rgba(14,34,22,0.45)',
      },
    },
  },
  plugins: [],
}
