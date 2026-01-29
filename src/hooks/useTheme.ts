import { getLocalStorage, setLocalStorage } from "@/lib/utils";
import { useEffect, useState } from "react";

const localStorageKey = "active-theme";
const getDefaultThemeSelected = () =>
  getLocalStorage(localStorageKey) || "system";

const useTheme = (defaultTheme = getDefaultThemeSelected()) => {
  const [theme, setTheme] = useState(defaultTheme); //here theme value can be light / dark / system

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    let newTheme = theme;

    if (theme === "system") {
      newTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    root.classList.add(newTheme);
    setLocalStorage(localStorageKey, newTheme);
  }, [theme]);

  return { theme, setTheme };
};

export default useTheme;
