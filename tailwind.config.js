/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        red: { DEFAULT: '#E5232B', dark: '#B01B22', light: '#FF4D54' },
        dark: { DEFAULT: '#0A0A0A', 2: '#111111', 3: '#1C1C1C', 4: '#2E2E2E' },
        muted: { DEFAULT: '#555555', light: '#888888' },
      },
      fontFamily: { sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'] },
    },
  },
  plugins: [],
};
