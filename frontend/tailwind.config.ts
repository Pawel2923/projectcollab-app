import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "#16a085",
        },
        tertiary: "var(--color-tertiary)",
        border: "var(--color-border)",
        "input-border": "var(--color-input-border)",
        "text-secondary": "var(--color-text-secondary)",
        light: {
          DEFAULT: "var(--color-light)",
          hover: "var(--color-light-hover)",
        },
        dark: {
          DEFAULT: "var(--color-dark)",
          hover: "var(--color-dark-hover)",
        },
      },
      fontFamily: {
        default: "var(--font-default)",
      },
      spacing: {
        "11": "2.75rem",
        "15": "3.75rem",
        "21": "5.25rem",
        "42": "10.5rem",
      },
      minWidth: {
        sm: "24rem",
        "96": "24rem",
      },
      minHeight: {
        "10": "2.5rem",
        "11": "2.75rem",
        "15": "3.75rem",
      },
      borderRadius: {
        lg: "0.5rem",
        sm: "0.3125rem",
        full: "9999px",
      },
      transitionDuration: {
        "75": "75ms",
        "300": "300ms",
      },
      brightness: {
        "80": "0.8",
        "120": "1.2",
      },
      boxShadow: {
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [],
};

export default config;
