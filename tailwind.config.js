/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#6366f1',
          DEFAULT: '#2563eb',
          dark: '#1e40af',
        },
        accent: {
          light: '#f0f4ff',
          DEFAULT: '#e0e7ff',
          dark: '#c7d2fe',
        },
        slate: {
          950: '#0f172a',
          900: '#1e293b',
          800: '#334155',
          700: '#475569',
          600: '#64748b',
          500: '#94a3b8',
          400: '#cbd5e1',
          300: '#e2e8f0',
          200: '#f1f5f9',
          100: '#f8fafc',
        },
      },
    },
  },
  plugins: [],
};
