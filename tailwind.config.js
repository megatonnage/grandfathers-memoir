/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          container: 'var(--color-primary-container)',
        },
        on: {
          primary: 'var(--color-on-primary)',
          surface: 'var(--color-on-surface)',
          'tertiary-container': 'var(--color-on-tertiary-container)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          container: 'var(--color-surface-container)',
          'container-low': 'var(--color-surface-container-low)',
          'container-highest': 'var(--color-surface-container-highest)',
          bright: 'var(--color-surface-bright)',
        },
        tertiary: 'var(--color-tertiary)',
        outline: {
          DEFAULT: 'var(--color-outline)',
          variant: 'var(--color-outline-variant)',
        }
      },
      fontFamily: {
        serif: ['var(--font-source-serif-4)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
        crimson: ['var(--font-crimson-text)', 'serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        headline: ['"Newsreader"', 'serif'],
        body: ['"Newsreader"', 'serif'],
        label: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
