import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { MessageSquare } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface SuggestionsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SuggestionsDialog({
  open,
  onClose,
}: SuggestionsDialogProps) {
  const { t } = useTranslation();

  const handleWhatsApp = () => {
    // Opens WhatsApp with the specific number
    window.open('https://wa.me/989376096172', '_blank');
  };

  const handleGmail = () => {
    // Opens default email client with specific email
    window.location.href = 'mailto:naturrre.app@gmail.com';
  };

  const handleTelegram = () => {
    // Opens Telegram with specific ID
    window.open('https://t.me/zabanfly_support', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-sm rounded-3xl p-0 overflow-hidden bg-white dark:bg-gray-800"
      >
        <VisuallyHidden>
          <DialogTitle>{t('suggestions.title')}</DialogTitle>
          <DialogDescription>
            {t('suggestions.desc')}
          </DialogDescription>
        </VisuallyHidden>

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-8 flex items-center justify-center">
          <div className="relative">
             <div className="absolute inset-0 bg-black/10 rounded-2xl transform translate-y-1 translate-x-1"></div>
             <div className="w-16 h-16 bg-transparent flex items-center justify-center relative z-10">
               <MessageSquare className="w-12 h-12 text-gray-900 fill-gray-900 stroke-[1.5]" />
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 text-center">
          <h2 className="text-gray-900 dark:text-gray-100 mb-1 leading-relaxed text-lg font-medium">
            {t('suggestions.headerTitle')}
          </h2>
          <h2 className="text-gray-900 dark:text-gray-100 mb-8 leading-relaxed text-lg font-medium">
             {t('suggestions.headerSubtitle')}
          </h2>

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-6 mb-10">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
              style={{ backgroundColor: '#25D366' }}
              aria-label="WhatsApp"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </button>

            {/* Gmail */}
            <button
              onClick={handleGmail}
              className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform bg-white shadow-sm border border-gray-100"
              aria-label="Gmail"
            >
              <svg width="32" height="32" viewBox="52 42 88 66" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285f4" d="M58 108h14V74L52 59v43c0 3.32 2.69 6 6 6"/>
                <path fill="#34a853" d="M120 108h14c3.32 0 6-2.69 6-6V59l-20 15"/>
                <path fill="#fbbc04" d="M120 48v26l20-15v-8c0-7.42-8.47-11.65-14.4-7.2"/>
                <path fill="#ea4335" d="M72 74V48l24 18 24-18v26L96 92"/>
                <path fill="#c5221f" d="M52 51v8l20 15V48l-5.6-4.2c-5.94-4.45-14.4-.22-14.4 7.2"/>
              </svg>
            </button>

            {/* Telegram */}
            <button
              onClick={handleTelegram}
              className="w-14 h-14 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
              style={{ backgroundColor: '#0088cc' }}
              aria-label="Telegram"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-full hover:bg-blue-700 transition-colors font-medium text-lg shadow-blue-200 dark:shadow-none shadow-lg"
          >
            {t('suggestions.close')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
