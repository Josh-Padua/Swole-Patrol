/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        lato: ['Lato-regular', 'sans-serif'],
        "lato-light": ['Lato-Light', 'sans-serif'],
        "lato-medium": ['Lato-Medium', 'sans-serif'],
        "lato-semibold": ['Lato-Semibold', 'sans-serif'],
        "lato-bold": ['Lato-Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}