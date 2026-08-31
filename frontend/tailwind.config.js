/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#1f5f5b',
          'teal-dark': '#164e4a',
          'teal-light': '#2d7a75',
          'teal-hover': '#1b524e',
          bg: '#f8faf9',
          card: '#ffffff',
          sage: '#e6f0eb',
          'sage-light': '#f2f7f4',
          'sage-border': '#d8e5df',
          'sage-text': '#24524c',
          text: '#111827',
          muted: '#6b7280',
          'muted-light': '#9ca3af',
        },
        risk: {
          high: {
            bg: '#fef2f2',
            text: '#e11d48',
            border: '#fecdd3',
            badge: '#ffe4e6',
            badgeText: '#be123c'
          },
          moderate: {
            bg: '#fffbeb',
            text: '#d97706',
            border: '#fde68a',
            badge: '#fef3c7',
            badgeText: '#b45309'
          },
          low: {
            bg: '#f0fdf4',
            text: '#16a34a',
            border: '#bbf7d0',
            badge: '#dcfce7',
            badgeText: '#15803d'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0,0,0,0.1)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
