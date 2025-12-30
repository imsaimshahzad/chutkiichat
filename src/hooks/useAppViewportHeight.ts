import { useEffect } from "react";

/**
 * Keeps a stable, keyboard-aware app height on mobile.
 * Prevents focus/scroll jumps that can cause the keyboard to dismiss.
 */
export const useAppViewportHeight = () => {
  useEffect(() => {
    const setAppHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    };

    setAppHeight();

    window.visualViewport?.addEventListener("resize", setAppHeight);
    // iOS Safari sometimes reports keyboard changes as visualViewport scroll
    window.visualViewport?.addEventListener("scroll", setAppHeight);
    window.addEventListener("resize", setAppHeight);

    return () => {
      window.visualViewport?.removeEventListener("resize", setAppHeight);
      window.visualViewport?.removeEventListener("scroll", setAppHeight);
      window.removeEventListener("resize", setAppHeight);
    };
  }, []);
};
