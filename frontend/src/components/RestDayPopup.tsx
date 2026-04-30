import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RestDayPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RestDayPopup: React.FC<RestDayPopupProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 z-[100]" style={{ zIndex: 100 }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-[32px] w-full max-w-[320px] overflow-hidden shadow-2xl"
                dir="rtl"
            >
                {/* Header */}
                <div className="bg-[#FFB703] h-32 flex items-center justify-center relative overflow-hidden">
                   {/* Decorative circles */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/20" />
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-white/20" />

                    <MessageCircle className="w-16 h-16 text-white relative z-10 fill-current" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="p-6 text-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-8 mt-2">
                        {t('lets_rest', 'امروز رو استراحت کنیم.')}
                    </h2>

                    <button
                        onClick={onClose}
                        className="w-full bg-[#3B82F6] hover:bg-[#2563EB] active:scale-95 text-white font-bold py-3 rounded-2xl text-lg transition-all shadow-lg shadow-blue-500/30"
                    >
                        {t('okay', 'باشه')}
                    </button>
                </div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
