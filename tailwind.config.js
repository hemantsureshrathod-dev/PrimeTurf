/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        prime: {
          lightBg: '#F7F5F0',
          lightCard: '#FFFFFF',
          lightText: '#1A1A1A',
          lightTextMuted: '#6B6B6B',
          lightAccent: '#3D9A50',
          lightBorder: '#E8E4DC',
          
          darkBg: '#0F1117',
          darkCard: '#1A1D26',
          darkText: '#F0EDE8',
          darkTextMuted: '#8A8A9A',
          darkAccent: '#4CAF61',
          darkBorder: '#2A2D36',
        }
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        outfit: ['"Outfit"', 'sans-serif'],
      },
      borderWidth: {
        '1': '1px',
      }
    },
  },
  plugins: [],
}
