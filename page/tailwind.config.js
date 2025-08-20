/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.pug",
    "./public/**/*.{html,js}",
    "./routes/**/*.js",
    "./server.js",
    "./app.js"
  ],
  safelist: [
    'bg-dark-50', 'bg-dark-100', 'bg-dark-200', 'bg-dark-300', 'bg-dark-400', 'bg-dark-500', 'bg-dark-600', 'bg-dark-700', 'bg-dark-800', 'bg-dark-900', 'bg-dark-950',
    'text-dark-50', 'text-dark-100', 'text-dark-200', 'text-dark-300', 'text-dark-400', 'text-dark-500', 'text-dark-600', 'text-dark-700', 'text-dark-800', 'text-dark-900', 'text-dark-950',
    'border-dark-50', 'border-dark-100', 'border-dark-200', 'border-dark-300', 'border-dark-400', 'border-dark-500', 'border-dark-600', 'border-dark-700', 'border-dark-800', 'border-dark-900', 'border-dark-950',
    'bg-primary-50', 'bg-primary-100', 'bg-primary-200', 'bg-primary-300', 'bg-primary-400', 'bg-primary-500', 'bg-primary-600', 'bg-primary-700', 'bg-primary-800', 'bg-primary-900',
    'text-primary-50', 'text-primary-100', 'text-primary-200', 'text-primary-300', 'text-primary-400', 'text-primary-500', 'text-primary-600', 'text-primary-700', 'text-primary-800', 'text-primary-900',
    'bg-accent-50', 'bg-accent-100', 'bg-accent-200', 'bg-accent-300', 'bg-accent-400', 'bg-accent-500', 'bg-accent-600', 'bg-accent-700', 'bg-accent-800', 'bg-accent-900',
    'text-accent-50', 'text-accent-100', 'text-accent-200', 'text-accent-300', 'text-accent-400', 'text-accent-500', 'text-accent-600', 'text-accent-700', 'text-accent-800', 'text-accent-900',
    'text-white', 'text-gray-100', 'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-gray-500', 'text-gray-600', 'text-gray-700', 'text-gray-800', 'text-gray-900',
    'bg-white', 'bg-gray-100', 'bg-gray-200', 'bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
    'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6', 'px-8', 'px-10', 'px-12', 'px-16',
    'py-1', 'py-2', 'py-3', 'py-4', 'py-6', 'py-8', 'py-12', 'py-16',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-6xl', 'text-8xl', 'text-9xl'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63'
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.8s ease-out'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgb(6 182 212), 0 0 10px rgb(6 182 212), 0 0 15px rgb(6 182 212)' },
          '100%': { boxShadow: '0 0 10px rgb(6 182 212), 0 0 20px rgb(6 182 212), 0 0 30px rgb(6 182 212)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [],
}