import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextType {
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  canInstall: boolean; // True if browser supports install prompt OR if it's iOS (manual install)
  install: () => Promise<void>; // Triggers prompt on Android, or does nothing on iOS (UI should handle iOS guide)
  deferredPrompt: BeforeInstallPromptEvent | null;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const usePWA = () => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

export const PWAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Platform detection
  const { isIOS, isAndroid } = useMemo(() => {
    if (typeof window === 'undefined') return { isIOS: false, isAndroid: false };

    const userAgent = window.navigator?.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(userAgent);

    return { isIOS, isAndroid };
  }, []);

  useEffect(() => {
    // Check if app is running in standalone mode (installed)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');

      setIsInstalled(isStandalone);
    };

    checkStandalone();
    window.addEventListener('resize', checkStandalone); // Sometimes display-mode changes on resize? unlikely but safe.

    // Capture the install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('resize', checkStandalone);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  // On iOS, "canInstall" is effectively true because user CAN install manually.
  // On Android/Desktop, "canInstall" depends on if we captured the prompt.
  const canInstall = !!deferredPrompt || isIOS;

  return (
    <PWAContext.Provider value={{
      isInstalled,
      isIOS,
      isAndroid,
      canInstall,
      install,
      deferredPrompt
    }}>
      {children}
    </PWAContext.Provider>
  );
};
