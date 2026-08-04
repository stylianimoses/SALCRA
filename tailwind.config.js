/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./about-us/**/*.html",
    "./operations/**/*.html",
    "./sustainability/**/*.html",
    "./benefits/**/*.html",
    "./media-centre/**/*.html",
    "./contact-us.html",
    "./**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00A859", // Vibrant Leaf Green
        secondary: "#C85A32", // Terracotta Clay
        accent: "#F2A900", // Warm Amber Gold
        success: "#F2A900", // Warm Amber Gold
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
