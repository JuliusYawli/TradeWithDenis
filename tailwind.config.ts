import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b1220",
        snow: "#f7fbff",
        line: "#dbeafe",
        gold: "#1553c5",
        red: "#0f3f9c",
        danger: "#b91c1c"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(21, 83, 197, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
