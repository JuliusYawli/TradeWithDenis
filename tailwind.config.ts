import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        snow: "rgb(var(--color-snow) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        gold: "rgb(var(--color-gold) / <alpha-value>)",
        red: "rgb(var(--color-red) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)"
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Helvetica Neue", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 20px 60px rgba(8, 26, 43, 0.13)",
        glow: "0 0 30px rgba(200, 146, 46, 0.24)",
        "glow-sm": "0 0 15px rgba(200, 146, 46, 0.12)"
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        "scale-in": "scaleIn 0.5s ease-out",
        "pulse-soft": "pulseSoft 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" }
        }
      }
    }
  },
  plugins: []
};

export default config;
