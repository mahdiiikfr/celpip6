import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LanguageProvider } from './contexts/LanguageContext';

// Import Celpip components
import CelpipTypeSelectScreen from './pages/CelpipTypeSelectScreen';
import CelpipReadingScreen from './pages/CelpipReadingScreen';
import CelpipListeningScreen from './pages/CelpipListeningScreen';
import CelpipWritingScreen from './pages/CelpipWritingScreen';
import CelpipSpeakingScreen from './pages/CelpipSpeakingScreen';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative overflow-hidden shadow-2xl pb-safe">
          <Routes>
            {/* Redirect root to celpip standalone default (e.g. mock test 1, writing) or a mock selection screen if we had one.
                Let's make a mock root route that redirects to the first test type select. */}
            <Route path="/" element={<Navigate to="/celpip/writing/1" replace />} />

            <Route path="/celpip/:type/:id" element={<CelpipTypeSelectScreen />} />
            <Route path="/celpip/:type/:id/reading" element={<CelpipReadingScreen />} />
            <Route path="/celpip/:type/:id/listening" element={<CelpipListeningScreen />} />
            <Route path="/celpip/:type/:id/writing" element={<CelpipWritingScreen />} />
            <Route path="/celpip/:type/:id/speaking" element={<CelpipSpeakingScreen />} />
          </Routes>
          <Toaster position="top-center" rtl={false} />
        </div>
      </Router>
    </LanguageProvider>
  );
}
