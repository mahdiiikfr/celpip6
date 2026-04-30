/**
 * Update theme color dynamically based on screen
 * This ensures status bar color matches the app header
 */

export function setThemeColor(color: string) {
  // Update all theme-color meta tags
  const metaTags = document.querySelectorAll('meta[name="theme-color"]');
  metaTags.forEach((tag) => {
    tag.setAttribute('content', color);
  });

  // Also update manifest theme color (if possible)
  // Note: This won't actually change the installed app's color,
  // but it's good practice
  if (document.querySelector('link[rel="manifest"]')) {
    // For future: can dynamically generate manifest
    console.log('Theme color updated to:', color);
  }
}

// Common colors used in the app
export const THEME_COLORS = {
  orange: '#f59e0b', // Main orange theme
  amber: '#fbbf24', // Lighter amber
  blue: '#3b82f6', // Blue accents
  green: '#10b981', // Green accents
  gray: '#f3f4f6', // Gray backgrounds
} as const;

// Set orange theme by default
if (typeof window !== 'undefined') {
  setThemeColor(THEME_COLORS.orange);
}
// Ensure file is included in patch
