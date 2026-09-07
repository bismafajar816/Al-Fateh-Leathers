import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        leather: {
          950: "#1c1410",
          900: "#2b2016",
          800: "#3d2c1c",
          700: "#5a4128",
          600: "#7a5834",
          500: "#9c7346",
          400: "#b9946a",
          300: "#d4b990",
          100: "#f2e9dc",
          50: "#faf6ef"
        },
        brass: "#a97c4f"
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "serif"]
      }
    }
  },
  plugins: []
};
export default config;
