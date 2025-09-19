// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#646cff", // hex
          dark: "#535bf2",
        },
        background: {
          dark: "#242424",
          light: "#ffffff", // putih
        },
        grayFix: {
          600: "#4b5563", // rgb dari gray-600
          50: "#f9fafb", // rgb dari gray-50
        },
      },
    },
    corePlugins: {
      preflight: true,
    },
    future: {
      disableColorOpacityUtilitiesByDefault: true,
    },
  },
  plugins: [],
};
