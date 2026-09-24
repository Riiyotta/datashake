/** @type {import('tailwindcss').Config} */
// CommonJS on purpose: Tailwind v3 caches ESM configs loaded via jiti, so edits to an ESM
// tailwind.config.js were not picked up by the long-running dev server.
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    screens: {
      // Webflow is desktop-first; use max-width screens to mirror its breakpoints.
      tablet: { max: '991px' },
      'mobile-l': { max: '767px' },
      'mobile-p': { max: '479px' },
    },
    extend: {
      colors: {
        black: '#0d0d0d',
        'pure-black': '#000000',
        'grey-v1': '#fafafa',
        'grey-v2': '#666666',
        border: '#d9d9d9',
        'dark-green': '#103a11',
        green: '#3fe844',
        red: '#c0392b',
        purple: '#a72bff',
        blue: '#3981ff',
        orange: '#ff930f',
        yellow: '#ffd521',
        link: '#2d62ff',
        focus: '#4d65ff',
        'light-orange': '#fff4e7',
        'light-green': '#ecfdec',
        'light-blue': '#ebf2ff',
        'light-purple': '#f6eaff',
        'light-yellow': '#fffbe9',
        dropdown: '#dddddd',
        // Hover states from the original's inline "global-styles" embed
        'green-hover': '#2fae33',
        'green-icon-hover': '#28912b',
        'black-hover': '#262626',
        'black-icon-hover': '#333333',
        'white-hover': '#f2f2f2',
        'white-icon-hover': '#e6e6e6',
        // #ffffff26 / #ffffff08 used on the dark-green free-trial card
        'white-15': 'rgba(255, 255, 255, 0.15)',
        'white-3': 'rgba(255, 255, 255, 0.03)',
      },
      borderColor: {
        DEFAULT: '#d9d9d9',
      },
      fontFamily: {
        display: ['Altriviera', 'Arial', 'sans-serif'],
        sans: ['Inter', 'Arial', 'sans-serif'],
        system: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
      maxWidth: {
        container: '90rem',
        narrow: '70rem',
      },
      borderWidth: {
        hair: '0.5px',
      },
    },
  },
  plugins: [],
}
