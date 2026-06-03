import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        editor: {
          bg: "#1e1e1e",
          sidebar: "#252526",
          active: "#2d2d2d",
          border: "#3e3e3e",
          text: "#cccccc",
          accent: "#7c5cfc",
          "accent-hover": "#9b7fff",
        },
      },
    },
  },
  plugins: [],
};

export default config;
