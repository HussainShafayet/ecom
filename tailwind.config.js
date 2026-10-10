const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spinning-cube': 'spin-cube 1.2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out both',
        'slide-up': 'slide-up 0.3s ease-out both',
        'pop': 'pop 0.35s ease-out',
      },
      keyframes: {
        // the product page's small motions (always under `motion-safe:`, so a shopper who asked for less motion gets none)
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } }, // opacity only: a transform on the page would make its fixed buy bar move with it while it runs
        'slide-up': { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        'pop': { '0%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.3)' }, '100%': { transform: 'scale(1)' } },
        'spin-cube': {
          '0%': { transform: 'rotateY(0deg) rotateX(0deg)' },
          '50%': { transform: 'rotateY(180deg) rotateX(180deg)' },
          '100%': { transform: 'rotateY(360deg) rotateX(360deg)' },
        },
      },
    },
  },
  plugins: [
    // `short:` is a phone held sideways (landscape and not tall): too short for a full-width picture above the details, and a fixed buy bar
    // over the bottom navigation would leave a third of the screen. Wide-enough ones (844 x 390) also match `md:`, where this says the same.
    plugin(({ addVariant }) => addVariant('short', '@media (orientation: landscape) and (max-height: 500px)')),
  ],
};
