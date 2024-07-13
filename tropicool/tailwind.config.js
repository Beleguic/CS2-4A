module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        'main' : '#696BE2',
        'secondary' : '#1D1F96',
        'beige' : '#FEFEF6',
        'beige-transparent-80' : 'rgba(254,254,246,80%)',
      }
    },
  },
  plugins: [],
};