import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // PBPI brand
        pbpi: { DEFAULT: '#C81E2C', dark: '#9E141F' },
        navy: { DEFAULT: '#0B2545', dark: '#071A33', light: '#13335C' },
        // Neutral surfaces
        bg: '#FFFFFF',
        surface: '#F7F7F5',
        surface2: '#EFEFEC',
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
      boxShadow: { card: '0 1px 2px rgba(11,37,69,0.06)' },
    },
  },
  plugins: [],
} satisfies Config
