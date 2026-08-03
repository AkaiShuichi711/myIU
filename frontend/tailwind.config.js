/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    borderRadius: {
      'none': '0px',
      'sm':   '6px',
      DEFAULT: '6px',
      'md':   '6px',
      'lg':   '6px',
      'xl':   '6px',
      '2xl':  '6px',
      '3xl':  '6px',
      'full': '6px',
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      
      },
    },
    extend: {
      colors: {
        // ── IU Brand ──────────────────────────────────────────────────────────
        'iu': {
          DEFAULT:  '#1e51f9',
          dark:     '#0e80b8',
          tint:     '#3aaee0',
          pale:     '#e0f4fc',
          navy:     '#2F398E',
          'navy-dark': '#1f2861',
        },
        // ── Zalo Blue (bl) ────────────────────────────────────────────────────
        'zbl': {
          200: '#0043a6',
          300: '#1e51f9',
          400: '#3386ff',
          500: '#66a4ff',
          600: '#99c3ff',
          700: '#cce1ff',
        },
        // ── Zalo Neutral Dark / Navy (nl) — dark-mode backgrounds ─────────────
        'znl': {
          100: '#050a19',
          200: '#4a4b4d',   // page bg dark
          300: '#19191a',   // card / sidebar dark
          400: '#33485c',   // elevated surface / border dark
          500: '#DCE3E8',   // muted text dark
          600: '#99a3ad',   // secondary text dark
          700: '#bfc6cc',   // primary text dark
        },
        // ── Zalo Neutral (nd) — light-mode text & borders ─────────────────────
        'znd': {
          200: '#dbdfe2',
          300: '#ccd1d6',
          400: '#8b8f92',
          500: '#19191a',
          600: '#19191a',
          700: '#090909',
        },
        // ── Zalo Light Gray (lg) — light-mode surfaces ────────────────────────
        'zlg': {
          300: '#778d9e',
          400: '#92a4b1',
          500: '#adbbc5',
          600: '#c9d1d8',
          700: '#e4e8ec',
        },
        // ── Zalo Teal (tl) — info / link ─────────────────────────────────────
        'ztl': {
          300: '#00adf4',
          400: '#33bcf6',
          500: '#66cef8',
          600: '#99defb',
          700: '#cceffd',
        },
        // ── Zalo Green (gl) — success ─────────────────────────────────────────
        'zgl': {
          300: '#00c578',
          400: '#33d193',
          500: '#66dcae',
          600: '#99e8c9',
          700: '#ccf3e4',
        },
        // ── Zalo Red (rl) — error / danger ────────────────────────────────────
        'zrl': {
          300: '#ef4e49',
          400: '#f2716d',
          500: '#f59592',
          600: '#f9b8b6',
          700: '#fcdcdb',
        },
        // ── Zalo Orange (ol) — warning ────────────────────────────────────────
        'zol': {
          300: '#f5832f',
          400: '#f79c59',
          500: '#f9b582',
          600: '#fbcdac',
          700: '#fde6d5',
        },
        // ── Zalo Yellow (yl) ─────────────────────────────────────────────────
        'zyl': {
          300: '#f8d15a',
          400: '#f9d97b',
          500: '#fbe39c',
          600: '#fcedbd',
          700: '#fef6de',
        },
        // ── Zalo Purple (pul) ─────────────────────────────────────────────────
        'zpul': {
          300: '#7562d8',
          400: '#9181e0',
          500: '#aca1e8',
          600: '#c8c0ef',
          700: '#e3e0f7',
        },
        // ── Legacy (kept for backward compat) ─────────────────────────────────
        'primary-500': '#877EFF',
        'primary-600': '#5D5FEF',
        'dark-1': '#000000',
        'dark-2': '#09090A',
        'dark-3': '#101012',
        'dark-4': '#1F1F22',
        'light-1': '#FFFFFF',
        'light-2': '#EFEFEF',
        'light-3': '#7878A3',
        'light-4': '#5C5C7B',
      },
      screens: {
        'xs': '480px',
      
      },
      width: {
        '420': '420px',
        '465': '465px',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],

      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
