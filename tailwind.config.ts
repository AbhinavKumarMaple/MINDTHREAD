import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        bg: {
          deep: '#07091A',
          DEFAULT: '#0A0A14',
          base: '#0A0A14',
        },
        surface: {
          DEFAULT: '#0E0F1E',
          raised: '#141424',
          high: '#1F1F2E',
        },
        line: '#262447',
        // Brand
        primary: {
          DEFAULT: '#8B5CF6',
          600: '#7C5CBF',
          700: '#6D28D9',
          soft: '#A78BFA',
        },
        ai: {
          DEFAULT: '#F49E12',
          soft: '#FBBF24',
        },
        action: '#2B78F7',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        // Text
        ink: {
          DEFAULT: '#F5F5F7',
          primary: '#F5F5F7',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
      },
      boxShadow: {
        glow: '0 4px 14px 0 rgba(244, 158, 18, 0.45)',
        'glow-primary': '0 4px 20px 0 rgba(139, 92, 246, 0.35)',
        card: '0 8px 24px 0 rgba(0, 0, 0, 0.35)',
        fab: '0 8px 24px 0 rgba(0, 0, 0, 0.45)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-left': 'slide-in-left 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
