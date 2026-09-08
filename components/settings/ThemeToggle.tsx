"use client";
import { useEffect, useState } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

type Theme = "system" | "light" | "dark";
const OPTIONS: { key: Theme; label: string; icon: typeof Sun }[] = [
  { key: "system", label: "system", icon: SunMoon },
  { key: "light", label: "light", icon: Sun },
  { key: "dark", label: "dark", icon: Moon },
];

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
  try {
    if (theme === "system") localStorage.removeItem("pip-theme");
    else localStorage.setItem("pip-theme", theme);
  } catch {
    /* ignore */
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pip-theme");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration sync from localStorage
      if (saved === "light" || saved === "dark") setTheme(saved);
    } catch {
      /* ignore */
    }
  }, []);
  function pick(t: Theme) {
    setTheme(t);
    apply(t);
  }
  return (
    <div
      className="flex gap-2 rounded-pill bg-surface p-1"
      role="radiogroup"
      aria-label="theme"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          role="radio"
          aria-checked={theme === o.key}
          onClick={() => pick(o.key)}
          className={`tap flex flex-1 items-center justify-center gap-2 rounded-pill px-4 py-2 text-sm font-semibold transition-colors duration-150 ${theme === o.key ? "bg-fg text-bg" : "text-fg-soft active:bg-line/40"}`}
        >
          <Icon icon={o.icon} size={16} /> {o.label}
        </button>
      ))}
    </div>
  );
}
