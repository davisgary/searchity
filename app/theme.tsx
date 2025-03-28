"use client";

import { createContext, useContext, useState, useEffect } from "react";

type ThemeType = "light" | "dark" | "auto";
interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function Theme({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("auto");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as ThemeType | null;
    const initialTheme = savedTheme || "auto";
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    html.classList.toggle("dark", isDark);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a Theme provider");
  return context;
}