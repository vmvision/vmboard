"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Theme } from "./types";

export const defaultTheme: Theme = {
  name: "default",
  light: {
    background: "hsl(0 0% 100%)",
    foreground: "hsl(240 10% 3.9%)",
    muted: "hsl(240 4.8% 95.9%)",
    "muted-foreground": "hsl(240 3.8% 46.1%)",
    popover: "hsl(0 0% 100%)",
    "popover-foreground": "hsl(240 10% 3.9%)",
    card: "hsl(0 0% 100%)",
    "card-foreground": "hsl(240 10% 3.9%)",
    border: "hsl(240 5.9% 90%)",
    input: "hsl(240 5.9% 90%)",
    primary: "hsl(240 5.9% 10%)",
    "primary-foreground": "hsl(0 0% 98%)",
    secondary: "hsl(240 4.8% 95.9%)",
    "secondary-foreground": "hsl(240 5.9% 10%)",
    accent: "hsl(240 4.8% 95.9%)",
    "accent-foreground": "hsl(240 5.9% 10%)",
    destructive: "hsl(0 84.2% 60.2%)",
    "destructive-foreground": "hsl(0 0% 98%)",
    ring: "hsl(240 5% 64.9%)",
    radius: "0.5rem",
    "chart-1": "hsl(220 70% 50%)",
    "chart-2": "hsl(340 75% 55%)",
    "chart-3": "hsl(30 80% 55%)",
    "chart-4": "hsl(280 65% 60%)",
    "chart-5": "hsl(160 60% 45%)",
    "chart-6": "hsl(180 50% 50%)",
    "chart-7": "hsl(216 50% 50%)",
    "chart-8": "hsl(252 50% 50%)",
    "chart-9": "hsl(288 50% 50%)",
    "chart-10": "hsl(324 50% 50%)",
    timing: "cubic-bezier(0.4, 0, 0.2, 1)",
    "sidebar-background": "hsl(0 0% 98%)",
    "sidebar-foreground": "hsl(240 5.3% 26.1%)",
    "sidebar-primary": "hsl(240 5.9% 10%)",
    "sidebar-primary-foreground": "hsl(0 0% 98%)",
    "sidebar-accent": "hsl(240 4.8% 95.9%)",
    "sidebar-accent-foreground": "hsl(240 5.9% 10%)",
    "sidebar-border": "hsl(220 13% 91%)",
    "sidebar-ring": "hsl(217.2 91.2% 59.8%)",
  },
  dark: {
    background: "hsl(240 10% 3.9%)",
    foreground: "hsl(0 0% 98%)",
    muted: "hsl(240 3.7% 15.9%)",
    "muted-foreground": "hsl(240 5% 64.9%)",
    popover: "hsl(240 10% 3.9%)",
    "popover-foreground": "hsl(0 0% 98%)",
    card: "hsl(240 10% 3.9%)",
    "card-foreground": "hsl(0 0% 98%)",
    border: "hsl(240 3.7% 15.9%)",
    input: "hsl(240 3.7% 15.9%)",
    primary: "hsl(0 0% 98%)",
    "primary-foreground": "hsl(240 5.9% 10%)",
    secondary: "hsl(240 3.7% 15.9%)",
    "secondary-foreground": "hsl(0 0% 98%)",
    accent: "hsl(240 3.7% 15.9%)",
    "accent-foreground": "hsl(0 0% 98%)",
    destructive: "hsl(0 62.8% 30.6%)",
    "destructive-foreground": "hsl(0 85.7% 97.3%)",
    ring: "hsl(240 3.7% 15.9%)",
    radius: "0.5rem",
    "chart-1": "hsl(220 70% 50%)",
    "chart-2": "hsl(340 75% 55%)",
    "chart-3": "hsl(30 80% 55%)",
    "chart-4": "hsl(280 65% 60%)",
    "chart-5": "hsl(160 60% 45%)",
    "chart-6": "hsl(180 50% 50%)",
    "chart-7": "hsl(216 50% 50%)",
    "chart-8": "hsl(252 50% 50%)",
    "chart-9": "hsl(288 50% 50%)",
    "chart-10": "hsl(324 50% 50%)",
    timing: "cubic-bezier(0.4, 0, 0.2, 1)",
    "sidebar-background": "hsl(240 5.9% 10%)",
    "sidebar-foreground": "hsl(240 4.8% 95.9%)",
    "sidebar-primary": "hsl(224.3 76.3% 48%)",
    "sidebar-primary-foreground": "hsl(0 0% 100%)",
    "sidebar-accent": "hsl(240 3.7% 15.9%)",
    "sidebar-accent-foreground": "hsl(240 4.8% 95.9%)",
    "sidebar-border": "hsl(240 3.7% 15.9%)",
    "sidebar-ring": "hsl(217.2 91.2% 59.8%)",
  },
};

type ThemeContextType = {
  theme: Theme | null;
  setTheme: (theme: Theme | null) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    if (!theme) return;

    const remove = () => {
      const oldStyle = document.getElementById("theme-vars");
      if (oldStyle) {
        oldStyle.remove();
      }
    };

    const style = document.createElement("style");
    style.setAttribute("id", "theme-vars");

    const lightCssVars = Object.entries(theme.light)
      .map(([key, value]) => `--${key}: ${value};`)
      .join("\n");
    const darkCssVars = Object.entries(theme.dark)
      .map(([key, value]) => `--${key}: ${value};`)
      .join("\n");
    style.innerHTML = `
    :root {
      ${lightCssVars}
    }
    .dark {
      ${darkCssVars}
    }
  `;
    remove();
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
