import { useEffect } from "react";

/**
 * Subtly shifts CSS custom properties based on time of day
 * Night (0-5): deep blue, low brightness
 * Morning (6-11): warmer cyan
 * Afternoon (12-17): standard cyan
 * Evening (18-23): deeper, purple-tinted
 */
export function useAdaptiveTheme() {
  useEffect(() => {
    const update = () => {
      const h = new Date().getHours();
      const root = document.documentElement.style;

      if (h >= 0 && h < 6) {
        // Night - deeper, more blue
        root.setProperty("--primary", "200 80% 45%");
        root.setProperty("--aurora-cyan", "200 80% 45%");
        root.setProperty("--foreground", "200 60% 65%");
      } else if (h >= 6 && h < 12) {
        // Morning - warm cyan
        root.setProperty("--primary", "180 100% 50%");
        root.setProperty("--aurora-cyan", "180 100% 50%");
        root.setProperty("--foreground", "180 80% 75%");
      } else if (h >= 12 && h < 18) {
        // Afternoon - standard vivid cyan
        root.setProperty("--primary", "187 100% 50%");
        root.setProperty("--aurora-cyan", "187 100% 50%");
        root.setProperty("--foreground", "187 100% 75%");
      } else {
        // Evening - purple tinted
        root.setProperty("--primary", "210 90% 55%");
        root.setProperty("--aurora-cyan", "210 90% 55%");
        root.setProperty("--foreground", "210 70% 72%");
      }
    };

    update();
    const interval = setInterval(update, 60000); // check every minute
    return () => clearInterval(interval);
  }, []);
}
