import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#14213d",
        ink: "#1f2937",
        gold: "#b88a2e",
        paper: "#f8f7f2",
        line: "#e5dfd0"
      },
      boxShadow: {
        panel: "0 18px 45px rgba(20, 33, 61, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
