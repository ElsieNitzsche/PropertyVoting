import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#070910',
        panel: 'rgba(16, 20, 36, 0.92)',
        border: 'rgba(120, 142, 182, 0.22)',
        accent: '#6d6eff',
        'accent-hover': '#5b5cee',
        success: '#2bc37b',
        warning: '#f3b13b',
        error: '#ef5350',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['DM Mono', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'md': '1.05rem',
        'lg': '1.35rem',
        'full': '999px',
      },
      backdropBlur: {
        'glass': '18px',
      },
    },
  },
  plugins: [],
};

export default config;
