import { useState, useEffect } from 'react';

export const useCourseLanguage = () => {
  const [courseLanguage, setCourseLanguageState] = useState<string>('English');

  useEffect(() => {
    const savedCourseLang = localStorage.getItem('courseLanguage');
    if (savedCourseLang) {
      setCourseLanguageState(savedCourseLang);
    }
  }, []);

  const setCourseLanguage = (lang: string) => {
    localStorage.setItem('courseLanguage', lang);
    setCourseLanguageState(lang);
  };

  return { courseLanguage, setCourseLanguage };
};
