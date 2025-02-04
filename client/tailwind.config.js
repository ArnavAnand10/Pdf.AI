/** @type {import('tailwindcss').Config} */
export default {

  daisyui: {
    themes: ["light", 'sunset', 'dracula','winter','bumblebee','corporate','hallowen', "dark", "cupcake",'dark','night','emerald','synthwave','fantasy'],
  },
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui'),require('tailwind-scrollbar-hide')],
}

