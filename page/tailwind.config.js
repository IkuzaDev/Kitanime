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
    // Custom color variations
    {
      pattern: /^(bg|text|border)-(dark|primary|accent)-(50|100|200|300|400|500|600|700|800|900|950)$/
    },
    // Standard gray and white variations  
    {
      pattern: /^(bg|text)-(white|gray)-(100|200|300|400|500|600|700|800|900)$/
    },
    // Spacing utilities
    {
      pattern: /^p[xytrbl]?-(1|2|3|4|5|6|8|10|12|16)$/
    },
    // Text sizes
    {
      pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|6xl|8xl|9xl)$/
    }
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
