import React from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface InstallPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: () => void;
  onLater: () => void;
}

export default function InstallPromotionDialog({ open, onOpenChange, onInstall, onLater }: InstallPromotionDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 p-0 overflow-hidden rounded-3xl border-0">
        <div className="relative">
             {/* Background Pattern */}
             <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 opacity-10 z-0"></div>

             <div className="flex flex-col items-center pt-10 pb-8 px-6 relative z-10">
                {/* Icon Animation */}
                <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center mb-6 relative">
                    <img src="/icon.svg" alt="App Icon" className="w-16 h-16" />
                    <div className="absolute -right-2 -bottom-2 bg-blue-600 text-white p-2 rounded-xl shadow-lg animate-bounce">
                        <Download className="w-5 h-5" />
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-3">
                    {t('pwa.promoTitle')}
                </h2>

                <p className="text-center text-gray-600 dark:text-gray-300 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
                    {t('pwa.promoDesc')}
                </p>

                <div className="flex flex-col w-full gap-3">
                    <Button
                        onClick={onInstall}
                        className="w-full h-12 text-base bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md shadow-amber-500/20"
                    >
                        {t('pwa.installNow')}
                    </Button>

                    <button
                        onClick={onLater}
                        className="w-full h-10 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                        {t('pwa.maybeLater')}
                    </button>

                    <p className="text-[10px] text-center text-gray-400 mt-2">
                        {t('pwa.menuHint')}
                    </p>
                </div>
             </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
