/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "app.vue",
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {
      fontFamily:{
        'titulo' : ['League Spartan', 'sans-serif'],
        'texto'  : ['Nunito', 'sans-serif']
      },
    },
  },
  plugins: [],
}
