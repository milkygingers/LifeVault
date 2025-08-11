/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vault-primary': '#6366f1',
        'vault-secondary': '#8b5cf6',
        'vault-accent': '#06b6d4',
        'vault-bg': '#f8fafc',
        'vault-surface': '#ffffff',
        'vault-text': '#1e293b',
        'vault-text-secondary': '#64748b',
      },
      fontFamily: {
        'vault': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      backgroundImage: {
        'gradient-vault': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-pastel': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
