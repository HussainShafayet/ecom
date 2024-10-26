module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spinning-cube': 'spin-cube 1.2s ease-in-out infinite',
      },
      keyframes: {
        'spin-cube': {
          '0%': { transform: 'rotateY(0deg) rotateX(0deg)' },
          '50%': { transform: 'rotateY(180deg) rotateX(180deg)' },
          '100%': { transform: 'rotateY(360deg) rotateX(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
