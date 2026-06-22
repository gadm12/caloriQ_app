/** @type {import('tailwindcss').Config} */

// These three colors are used with opacity modifiers (/30, /5, etc.)
// so they reference CSS variables that dark mode can swap at runtime.
function cssVar(name) {
  return ({ opacityValue }) =>
    opacityValue !== undefined
      ? `rgb(var(${name}) / ${opacityValue})`
      : `rgb(var(${name}))`
}

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSS-variable colors (support opacity modifiers AND dark mode swap)
        'primary':          cssVar('--c-primary'),
        'outline-variant':  cssVar('--c-outline-variant'),
        'surface-dim':      cssVar('--c-surface-dim'),

        // Fixed colors (dark mode handled via CSS overrides in index.css)
        'on-primary': '#ffffff',
        'on-primary-container': '#00574d',
        'primary-container': '#2dd4bf',
        'primary-fixed': '#62fae3',
        'primary-fixed-dim': '#3cddc7',
        'on-primary-fixed': '#00201c',
        'on-primary-fixed-variant': '#005047',

        'secondary': '#006a61',
        'on-secondary': '#ffffff',
        'secondary-container': '#86f2e4',
        'on-secondary-container': '#006f66',
        'secondary-fixed': '#89f5e7',
        'secondary-fixed-dim': '#6bd8cb',
        'on-secondary-fixed': '#00201d',
        'on-secondary-fixed-variant': '#005049',

        'tertiary': '#855300',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#ffad3a',
        'on-tertiary-container': '#6d4400',
        'tertiary-fixed': '#ffddb8',
        'tertiary-fixed-dim': '#ffb95f',
        'on-tertiary-fixed': '#2a1700',
        'on-tertiary-fixed-variant': '#653e00',

        'surface': '#f8f9ff',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'surface-variant': '#d3e4fe',
        'surface-tint': '#006b5f',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#3c4a46',
        'on-background': '#0b1c30',
        'background': '#f8f9ff',

        'outline': '#6b7a76',

        'error': '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',

        'inverse-primary': '#3cddc7',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '48px',
        gutter: '20px',
        'container-max': '1200px',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        'stats-number': ['Plus Jakarta Sans', 'sans-serif'],
        'headline-lg-mobile': ['Plus Jakarta Sans', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'headline-lg': ['Plus Jakarta Sans', 'sans-serif'],
        'display-lg': ['Plus Jakarta Sans', 'sans-serif'],
        'label-md': ['Inter', 'sans-serif'],
        'headline-md': ['Plus Jakarta Sans', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
      },
      fontSize: {
        'stats-number': ['20px', { lineHeight: '24px', fontWeight: '700' }],
        'headline-lg-mobile': ['24px', { lineHeight: '32px', fontWeight: '700' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '700' }],
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      },
      maxWidth: {
        'container-max': '1200px',
      },
    },
  },
  plugins: [],
}
