import { useEffect } from "react";

export function useAdaptiveTheme() {
  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      const root = document.documentElement.style;

      if (h >= 0 && h < 6) {
        root.setProperty("--primary", "155 80% 32%");
        root.setProperty("--aurora-cyan", "155 80% 32%");
        root.setProperty("--foreground", "150 50% 55%");
      } else if (h >= 6 && h < 12) {
        root.setProperty("--primary", "148 100% 38%");
        root.setProperty("--aurora-cyan", "148 100% 38%");
        root.setProperty("--foreground", "150 60% 62%");
      } else if (h >= 12 && h < 18) {
        root.setProperty("--primary", "150 100% 40%");
        root.setProperty("--aurora-cyan", "150 100% 40%");
        root.setProperty("--foreground", "150 60% 65%");
      } else {
        root.setProperty("--primary", "152 85% 35%");
        root.setProperty("--aurora-cyan", "152 85% 35%");
        root.setProperty("--foreground", "150 50% 58%");
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);
}
