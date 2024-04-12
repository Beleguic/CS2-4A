module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors : {
        'cstm-orange' : '#F6AE20',
        'cstm-green' : '#42C686',
        'cstm-purple' : '#9644FF'
      }
    },
  },
  plugins: [],
};