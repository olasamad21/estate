import { useEffect } from 'react';

export function useVisualViewport() {
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? (window.visualViewport ?? null) : null;
    if (!vv) return undefined;

    const root = document.documentElement;

    const syncViewport = () => {
      if ((vv.scale ?? 1) > 1.01) {
        root.style.removeProperty('--app-h');
        root.style.removeProperty('--app-offset-top');
        return;
      }
      root.style.setProperty('--app-h', `${vv.height}px`);
      root.style.setProperty('--app-offset-top', `${vv.offsetTop}px`);
    };

    syncViewport();
    vv.addEventListener('resize', syncViewport);
    vv.addEventListener('scroll', syncViewport);

    return () => {
      vv.removeEventListener('resize', syncViewport);
      vv.removeEventListener('scroll', syncViewport);
      root.style.removeProperty('--app-h');
      root.style.removeProperty('--app-offset-top');
    };
  }, []);
}

export default useVisualViewport;
