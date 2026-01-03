import { useEffect, useCallback } from "react";

/**
 * Keeps a stable, keyboard-aware app height on mobile.
 * Uses 100dvh as primary approach with fallback for older browsers.
 * Prevents focus/scroll jumps that can cause the keyboard to dismiss.
 */
export const useAppViewportHeight = () => {
  const setAppHeight = useCallback(() => {
    // Use visualViewport for accurate height when keyboard is open
    const vh = window.visualViewport?.height ?? window.innerHeight;
    document.documentElement.style.setProperty("--app-height", `${vh}px`);
    
    // Also set viewport offset for keyboard handling
    const offset = window.visualViewport?.offsetTop ?? 0;
    document.documentElement.style.setProperty("--viewport-offset", `${offset}px`);
  }, []);

  useEffect(() => {
    setAppHeight();

    // Listen to viewport changes (keyboard open/close)
    const visualViewport = window.visualViewport;
    
    if (visualViewport) {
      visualViewport.addEventListener("resize", setAppHeight);
      visualViewport.addEventListener("scroll", setAppHeight);
    }
    
    window.addEventListener("resize", setAppHeight);
    window.addEventListener("orientationchange", setAppHeight);

    return () => {
      if (visualViewport) {
        visualViewport.removeEventListener("resize", setAppHeight);
        visualViewport.removeEventListener("scroll", setAppHeight);
      }
      window.removeEventListener("resize", setAppHeight);
      window.removeEventListener("orientationchange", setAppHeight);
    };
  }, [setAppHeight]);
};
