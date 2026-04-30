import { useEffect, useState } from 'react';
import { useLocation, useOutlet, useNavigate } from 'react-router-dom';
import SplashScreen from '@/pages/SplashScreen';
import SimpleSplashScreen from '@/components/SimpleSplashScreen';
import { useLanguage } from '@/hooks/useLanguage';
import { getUserProfile } from '@/types/user';
import { setThemeColor } from '@/lib/themeColor';

const APP_VERSION = '2.2';

export default function ProtectedAppLayout() {
  const { setLanguage } = useLanguage();
  // 'loading' is initial state before we verify version
  const [splashState, setSplashState] = useState<'checking' | 'download' | 'simple' | 'none'>('checking');

  const location = useLocation();
  const outlet = useOutlet();
  const navigate = useNavigate();

  useEffect(() => {
    // Strict Auth Check
    const user = getUserProfile();
    const publicPaths = ['/login', '/verify', '/nationality', '/referral', '/level-test'];
    const currentPath = location.pathname.replace(/\/$/, ''); // Normalize: remove trailing slash

    if (!user && !publicPaths.includes(currentPath)) {
        navigate('/login', { replace: true });
    }

    // Re-apply language on app mount to ensure consistency
    const savedLang = localStorage.getItem('appLanguage') as 'fa' | 'en' || 'fa';
    setLanguage(savedLang);

    // Apply global font size
    const storedSize = localStorage.getItem('appFontSize');
    let size = 15;
    if (storedSize) {
        size = parseInt(storedSize, 10);
    } else {
        // Based on user feedback, size 15 is standard across all platforms
        size = 15;
    }
    document.documentElement.style.fontSize = `${size}px`;

    // Check App Version for Splash Logic
    const cachedVersion = localStorage.getItem('appCachedVersion');
    if (cachedVersion === APP_VERSION) {
        setSplashState('simple');
    } else {
        setSplashState('download');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleDownloadFinish = () => {
      localStorage.setItem('appCachedVersion', APP_VERSION);
      setSplashState('none');
  };

  const handleSimpleFinish = () => {
      setSplashState('none');
  };

  if (splashState === 'checking') {
      return null; // Or a minimal spinner
  }

  if (splashState === 'download') {
      return <SplashScreen onFinish={handleDownloadFinish} />;
  }

  if (splashState === 'simple') {
      return <SimpleSplashScreen onFinish={handleSimpleFinish} />;
  }

  return (
    <>
      {outlet}
    </>
  );
}
