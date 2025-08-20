import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // VS Code Theme Colors
        'vscode-bg': 'hsl(225, 9%, 12%)',
        'vscode-surface': 'hsl(226, 10%, 15%)',
        'vscode-border': 'hsl(225, 6%, 25%)',
        'vscode-primary': 'hsl(207, 90%, 54%)',
        'vscode-purple': 'hsl(268, 60%, 60%)',
        'vscode-text': 'hsl(0, 0%, 80%)',
        'vscode-text-muted': 'hsl(0, 0%, 59%)',
        'vscode-success': 'hsl(158, 70%, 58%)',
        'vscode-warning': 'hsl(42, 93%, 56%)',
        'vscode-error': 'hsl(0, 75%, 65%)',

        // Standard shadcn colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
        'sans': ['Inter', 'ui-sans-serif', 'system-ui']
      },
      spacing: {
        'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
