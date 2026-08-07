import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "kcaltrack-theme";

function apply(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

function read(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* storage indisponível */
  }
  return "dark";
}

/** Tema claro/escuro persistido no navegador. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = read();
    setTheme(initial);
    apply(initial);
    setReady(true);
  }, []);

  const update = useCallback((next: Theme) => {
    setTheme(next);
    apply(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage indisponível */
    }
  }, []);

  const toggle = useCallback(() => {
    update(theme === "dark" ? "light" : "dark");
  }, [theme, update]);

  return { theme, ready, setTheme: update, toggle };
}

/** Script inline que aplica o tema antes da hidratação, evitando flash. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${STORAGE_KEY}');t=(t==='light'||t==='dark')?t:'dark';var r=document.documentElement;r.classList.add(t);r.classList.remove(t==='dark'?'light':'dark');}catch(e){document.documentElement.classList.add('dark');}})();`;
