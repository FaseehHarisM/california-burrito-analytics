/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── California Burrito Brand Palette ───────────────────────────────
        cb: {
          red:         '#E8231A',   // primary red — logo oval, navbar
          'red-dark':  '#C41D14',   // darker red for hover states
          'red-light': '#FDF0EF',   // very light blush for card accents
          green:       '#1B4332',   // dark forest green — text shadow, sections
          'green-mid': '#2D6A4F',   // mid-tone deep green
          'green-light':'#EAF4EE',  // pale green for subtle backgrounds
          cream:       '#F5F0DC',   // cream — logo text fill, page bg
          'cream-dark':'#EDE8C8',   // slightly darker cream for borders
          'cream-bg':  '#FAF8F0',   // very warm off-white page background
        },
        // ─── Keep neutral grays for data/text hierarchy ───────────────────
        slate: {
          50:  '#FAF8F0',   // cream-tinted rather than pure cool gray
          100: '#F3F0E6',
          200: '#E5E0D0',
          300: '#C8C2AA',
          400: '#9C9480',
          500: '#7A7260',
          600: '#5C5648',
          700: '#433E32',
          800: '#2C2820',
          900: '#1A1812',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Georgia', 'serif'],  // for headers when we want that retro CB feel
      },
      boxShadow: {
        'cb-sm':  '0 1px 3px 0 rgba(27, 67, 50, 0.08), 0 1px 2px -1px rgba(27, 67, 50, 0.04)',
        'cb-md':  '0 4px 12px 0 rgba(27, 67, 50, 0.10)',
        'cb-lg':  '0 8px 24px 0 rgba(27, 67, 50, 0.12)',
        'xs':     '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '2xs':    '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
}
