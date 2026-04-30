import React from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface IOSInstallGuideProps {
  open: boolean;
  onClose: () => void;
}

export default function IOSInstallGuide({ open, onClose }: IOSInstallGuideProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 p-0 overflow-hidden rounded-3xl border-0">
        {/* Header */}
        <div className="bg-amber-500 p-4 text-center relative">
          <button
            onClick={onClose}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-white font-bold text-lg">{t('pwa.iosGuideTitle')}</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
            <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
                {t('pwa.iosGuideDesc')}
            </p>

            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <Share className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                    <span className="block font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">
                        1. Share Button
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Tap the Share icon at the bottom of Safari.
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-2xl">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlusSquare className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1">
                    <span className="block font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">
                        2. Add to Home Screen
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Find and select &quot;Add to Home Screen&quot;.
                    </span>
                </div>
            </div>

            <div className="text-center pt-2">
                <span className="text-xs text-amber-500 font-medium">
                    {t('pwa.iosNote')}
                </span>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
