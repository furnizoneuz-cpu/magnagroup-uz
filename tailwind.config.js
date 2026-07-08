/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary accent — brand green (from the logo). `gold-*` utilities resolve to green.
        gold: {
          DEFAULT: "#22A836",
          dark: "#12801F",
          light: "#E8F6EA",
        },
        brand: {
          DEFAULT: "#22A836",
          dark: "#12801F",
          light: "#E8F6EA",
        },
        // Secondary premium accent — bronze
        bronze: {
          DEFAULT: "#C5A880",
          dark: "#A98A5F",
          light: "#F2EADD",
        },
        ink: {
          DEFAULT: "#1E2229",
          soft: "#2D3139",
        },
        sand: "#F1F3F6",
        surface: "#F8F9FA",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "Segoe UI", "Roboto", "sans-serif"],
        head: ["var(--font-montserrat)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "8px",
        xl: "10px",
        "2xl": "14px",
      },
    },
  },
  plugins: [],
};
