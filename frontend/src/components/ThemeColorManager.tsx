import { useEffect } from 'react';

const ORANGE_THEME = '#f59e0b';

/**
 * A component that aggressively enforces the orange theme color
 * for the browser address bar (meta theme-color).
 *
 * It uses a MutationObserver to watch for changes to the meta tag
 * and reverts them immediately if they deviate from the required color.
 */
export default function ThemeColorManager() {
  useEffect(() => {
    // Helper to enforce strict state
    const enforceColor = () => {
        const metaTags = document.querySelectorAll('meta[name="theme-color"]');

        // 1. Remove duplicates if any
        if (metaTags.length > 1) {
            for (let i = 1; i < metaTags.length; i++) {
                metaTags[i].remove();
            }
        }

        // 2. Ensure the first one is correct
        let mainTag = document.querySelector('meta[name="theme-color"]');
        if (!mainTag) {
            mainTag = document.createElement('meta');
            mainTag.setAttribute('name', 'theme-color');
            document.head.appendChild(mainTag);
        }

        if (mainTag.getAttribute('content') !== ORANGE_THEME) {
            mainTag.setAttribute('content', ORANGE_THEME);
        }

        // 3. Enforce apple-mobile-web-app-status-bar-style to "default" (not black-translucent)
        let appleTag = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
        if (appleTag) {
            if (appleTag.getAttribute('content') !== 'default') {
                appleTag.setAttribute('content', 'default');
            }
        }
    };

    // 1. Initial set
    enforceColor();

    // 2. Setup MutationObserver
    const observer = new MutationObserver((mutations) => {
       let shouldAct = false;
       for (const mutation of mutations) {
           // Check for theme-color meta tag changes
           if (mutation.target.nodeName === 'META' && (mutation.target as Element).getAttribute('name') === 'theme-color') {
               shouldAct = true;
           }
           // Check for head child list changes (add/remove)
           if (mutation.target.nodeName === 'HEAD') {
               shouldAct = true;
           }
           // Check for class changes on HTML (dark mode toggle often triggers theme re-eval)
           if (mutation.target.nodeName === 'HTML' && mutation.attributeName === 'class') {
               shouldAct = true;
           }
       }
       if (shouldAct) {
           enforceColor();
       }
    });

    // Observe Head (children)
    observer.observe(document.head, { childList: true, subtree: true, attributes: true, attributeFilter: ['content'] });

    // Observe HTML (class changes for dark mode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // 3. Listen for Visibility Change
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            enforceColor();
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. Periodic check (Safety net)
    const interval = setInterval(enforceColor, 1000);

    return () => {
        observer.disconnect();
        clearInterval(interval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}

function setThemeColor(color: string) {
  let metaTag = document.querySelector('meta[name="theme-color"]');
  if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTag);
  }
  metaTag.setAttribute('content', color);
}
