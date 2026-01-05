import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Salary-man color palette - inspired by Japanese aesthetic
        'sm': {
          'bg': '#0f0f12',
          'surface': '#1a1a21',
          'surface-alt': '#24242e',
          'border': '#2e2e3a',
          'text': '#e8e6e3',
          'text-muted': '#8b8993',
          'accent': '#ff6b6b',
          'accent-glow': '#ff6b6b40',
          'income': '#4ade80',
          'expense': '#f87171',
          'warning': '#fbbf24',
          'card': '#ff8e53',
        }
      },
      fontFamily: {
        'display': ['Zen Maru Gothic', 'Sarabun', 'sans-serif'],
        'body': ['Sarabun', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 107, 107, 0.3)',
        'glow-income': '0 0 20px rgba(74, 222, 128, 0.3)',
        'glow-expense': '0 0 20px rgba(248, 113, 113, 0.3)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config

