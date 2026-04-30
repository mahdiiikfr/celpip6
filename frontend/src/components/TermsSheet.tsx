import { useTranslation } from 'react-i18next';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
} from './ui/drawer';
import { XCircle } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface TermsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TermsSheet({ open, onOpenChange }: TermsSheetProps) {
  const { t, i18n } = useTranslation();
  const dir = i18n.dir();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="h-[85vh] w-full p-0 bg-white dark:bg-gray-800 border-none overflow-hidden"
        dir={dir}
      >
        <DrawerTitle className="sr-only">{t('terms.title')}</DrawerTitle>
        <DrawerDescription className="sr-only">{t('terms.subtitle')}</DrawerDescription>

        {/* Yellow Header (Matches DownloadWaitDialog) */}
        <div className="bg-[#FFAA00] flex justify-between items-center px-4 py-3 shrink-0 rounded-t-[10px]">
          <button
            onClick={() => onOpenChange(false)}
            className="text-black/80 hover:text-black transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
          <span className="text-black font-bold text-sm">{t('terms.title')}</span>
          <div className="w-6"></div> {/* Spacer to center title */}
        </div>

        {/* Content Area */}
        <ScrollArea className="flex-1 p-6" dir={dir}>
          <div className={`space-y-4 ${dir === 'rtl' ? 'text-right' : 'text-left'} pb-8`}>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-bold mb-2">
              {t('terms.subtitle')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('terms.p1')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('terms.p2')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('terms.p3')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('terms.p4')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('terms.p5')}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium mt-4">
              {t('terms.p6')}
            </p>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
