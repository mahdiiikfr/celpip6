import { useEffect } from 'react';
import { setThemeColor } from '../lib/themeColor';

/**
 * Custom hook to set theme color for a component
 * This will update the status bar color on mobile devices
 */
export function useThemeColor(color: string) {
  useEffect(() => {
    setThemeColor(color);

    // Cleanup: restore default orange when component unmounts
    return () => {
      setThemeColor('#f59e0b');
    };
  }, [color]);
}
