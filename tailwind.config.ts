import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // PBPI brand
        pbpi: { DEFAULT: '#C81E2C', dark: '#9E141F' },
        navy: { DEFAULT: '#14282D', dark: '#0C1B20', light: '#24434A' },
        lime: '#D8F36A',
        // Neutral surfaces
        bg: '#FFFFFF',
        surface: '#F5F6F1',
        surface2: '#EBEEE5',
        // Legacy aliases kept so untouched components (admin/athlete areas)
        // still resolve — same palette, mapped onto the light theme.
        ink: '#0F1720',
        muted: '#65707A',
        line: '#E3E3DE',
        accent: '#C81E2C',
        accentDeep: '#9E141F',
        border: '#E3E3DE',
        text: '#0F1720',
        textMuted: '#65707A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: { site: '1360px' },
       boxShadow: { card: '0 12px 40px rgba(20,40,45,0.07)' },
    },
  },
  plugins: [],
} satisfies Config
