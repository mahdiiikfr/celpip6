export const useLanguage = () => {
  const language = localStorage.getItem('appLanguage') || 'fa';

  const setLanguage = (lang: 'fa' | 'en') => {
    localStorage.setItem('appLanguage', lang);
    if (lang === 'en') {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    } else {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'fa');
    }
  };

  // Initial set
  if (!document.documentElement.getAttribute('dir')) {
    setLanguage(language as 'fa' | 'en');
  }

  return { language, setLanguage };
};
