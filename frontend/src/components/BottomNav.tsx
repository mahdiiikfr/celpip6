import { useNavigate } from 'react-router-dom';
import { Home, BookOpen, PenLine, ListChecks } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useState } from 'react';

interface BottomNavProps {
  activeItem: 'home' | 'grammar' | 'tests' | 'menu';
}

export default function BottomNav({ activeItem }: BottomNavProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Re-use access check logic
  const checkGrammarAccess = () => {
      if (i18n.language !== 'fa') return false;
      const userNationality = localStorage.getItem('userNationality');
      if (!userNationality) return false;
      try {
          const { code } = JSON.parse(userNationality);
          return ['IR', 'TJ', 'AF'].includes(code);
      } catch {
          return false;
      }
  };
  const showGrammar = checkGrammarAccess();

  const navItems = [
    { id: 'home', label: t('home.nav.home'), icon: Home, path: '/home' },
    ...(showGrammar ? [{ id: 'grammar', label: t('home.nav.grammar'), icon: PenLine, path: '/grammar' }] : []),
    { id: 'tests', label: t('home.nav.tests'), icon: BookOpen, path: '/tests' },
    { id: 'menu', label: t('home.nav.menu'), icon: ListChecks, path: '/menu' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-20 transition-colors">
      <div className="flex justify-around items-center max-w-md mx-auto px-4 py-3 relative pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={clsx(
                "flex flex-col items-center gap-1 transition-colors relative z-10",
                isActive ? "text-white" : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              )}
            >
              {isActive && (
                 <div className="absolute -inset-x-4 -inset-y-2 bg-blue-600 rounded-full shadow-lg shadow-blue-200 dark:shadow-blue-900/20 -z-10"></div>
              )}

              <item.icon className={clsx("w-6 h-6", isActive ? "text-white" : "")} />
              <span className={clsx("text-xs", isActive ? "text-white" : "")}>
                {item.label}
              </span>

              {isActive && (
                 <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-3 py-1 rounded-lg shadow-md whitespace-nowrap z-20">
                   <span className="text-xs text-gray-700 dark:text-gray-300">{item.label}</span>
                 </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
