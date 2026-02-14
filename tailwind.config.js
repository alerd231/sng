/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.25rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '3.5rem',
      },
      screens: {
        '2xl': '1360px',
      },
    },
    extend: {
      colors: {
        graphite: '#121417',
        frame: '#1a1d22',
        canvas: '#f5f6f8',
        ink: '#121316',
        muted: '#5f646d',
        line: '#d9dde3',
        accent: '#b81d27',
        accentDark: '#8f161e',
      },
      fontFamily: {
        sans: ['Bahnschrift', 'Segoe UI', 'Arial', 'sans-serif'],
        heading: ['Bahnschrift', 'Segoe UI', 'Arial', 'sans-serif'],
        mono: ['Consolas', 'Courier New', 'monospace'],
      },
      boxShadow: {
        panel: '0 20px 45px rgba(10, 14, 24, 0.14)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
