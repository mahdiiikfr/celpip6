import React from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

interface PersistentLayoutProps {
  children: React.ReactNode;
}

export default function PersistentLayout({ children }: PersistentLayoutProps) {
  const location = useLocation();
  const path = location.pathname;

  // Define paths where BottomNav should appear
  // Updated: '/' is now Landing Page (no nav). '/home' is the new Home Screen (needs nav).
  const showNavPaths = ['/home', '/grammar', '/tests', '/menu'];

  // Exact match logic is preferred for these main tabs
  const showNav = showNavPaths.includes(path);

  // Determine active item
  let activeItem: 'home' | 'grammar' | 'tests' | 'menu' = 'home';
  if (path === '/grammar') activeItem = 'grammar';
  if (path === '/tests') activeItem = 'tests';
  if (path === '/menu') activeItem = 'menu';

  return (
    <>
      <div className={showNav ? "pb-24" : ""}>
        {children}
      </div>
      {showNav && <BottomNav activeItem={activeItem} />}
    </>
  );
}
