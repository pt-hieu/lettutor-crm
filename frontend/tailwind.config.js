module.exports = {
  mode: 'jit',
  purge: [
    './pages/**/*.tsx',
    './utils/components/**/*.tsx',
    './components/**/*.tsx',
  ],
  darkMode: 'class',
  theme: {
    screens: {
      '2xl': { max: '1535px' },
      xl: { max: '1279px' },
      lg: { max: '1023px' },
      md: { max: '767px' },
      sm: { max: '639px' },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
}
