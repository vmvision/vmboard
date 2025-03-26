"use client";

import {
  createContext,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import type { DerivedTheme } from "./types";

type ThemeContextType = {
  theme: DerivedTheme | null;
  setTheme: (theme: DerivedTheme | null) => void;
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
  const [theme, setTheme] = useState<DerivedTheme | null>(null);

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

    style.innerHTML = `
    :root {
      ${theme.light}
    }
    .dark {
      ${theme.dark}
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
        setTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
