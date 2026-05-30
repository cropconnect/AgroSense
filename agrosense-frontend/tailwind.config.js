export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4caf50',
        'primary-dark': '#388e3c',
        'primary-soft': '#a5d6a7',
        'primary-tint': '#e8f5e9',
        water: '#29b6f6',
        warning: '#ffa726',
        danger: '#ef5350',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
