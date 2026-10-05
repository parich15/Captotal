/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/app.vue",
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
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
