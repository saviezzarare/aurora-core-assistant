import { useEffect } from "react";

/**
 * Subtly shifts CSS custom properties based on time of day
 * Night (0-5): deep indigo-blue
 * Morning (6-11): warmer blue
 * Afternoon (12-17): vivid blue
 * Evening (18-23): deeper purple-blue
 */
export function useAdaptiveTheme() {
  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      const root = document.documentElement.style;

      if (h >= 0 && h < 6) {
        root.setProperty("--primary", "225 80% 48%");
        root.setProperty("--aurora-cyan", "225 80% 48%");
        root.setProperty("--foreground", "220 60% 68%");
      } else if (h >= 6 && h < 12) {
        root.setProperty("--primary", "210 100% 55%");
        root.setProperty("--aurora-cyan", "210 100% 55%");
        root.setProperty("--foreground", "210 80% 78%");
      } else if (h >= 12 && h < 18) {
        root.setProperty("--primary", "215 100% 55%");
        root.setProperty("--aurora-cyan", "215 100% 55%");
        root.setProperty("--foreground", "210 100% 78%");
      } else {
        root.setProperty("--primary", "230 85% 52%");
        root.setProperty("--aurora-cyan", "230 85% 52%");
        root.setProperty("--foreground", "225 70% 72%");
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);
}
