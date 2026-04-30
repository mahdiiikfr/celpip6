import { MessageCircle, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

interface SuggestBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SuggestBookDialog({
  open,
  onOpenChange,
}: SuggestBookDialogProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const handleShare = (platform: 'whatsapp' | 'gmail' | 'telegram') => {
    const message = t('suggest.title');

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        break;
      case 'gmail':
        window.open(
          `mailto:?subject=${encodeURIComponent(t('suggest.emailSubject'))}&body=${encodeURIComponent(message)}`,
        );
        break;
      case 'telegram':
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(message)}`,
        );
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm w-[calc(100%-2rem)] mx-auto bg-white dark:bg-gray-800 rounded-3xl"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 -mx-6 -mt-6 pt-6 pb-4 rounded-t-3xl mb-4">
            <div className="flex justify-center mb-2">
              <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-center text-xl dark:text-white">
            {t('suggest.title')}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
            {t('suggest.body')}
          </DialogDescription>
        </DialogHeader>

        {/* Social Share Buttons */}
        <div className="flex justify-center gap-6 my-6">
          <button
            onClick={() => handleShare('whatsapp')}
            className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
              <path d="M16 2C8.268 2 2 8.268 2 16c0 2.497.654 4.845 1.799 6.879L2 30l7.197-1.789A13.945 13.945 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm7.038 19.23c-.297.835-1.477 1.535-2.415 1.738-.634.137-1.463.247-4.253-.914-3.564-1.484-5.86-5.128-6.038-5.366-.175-.238-1.44-1.918-1.44-3.661 0-1.743.912-2.6 1.235-2.954.324-.354.707-.442 1.06-.442.177 0 .335.008.483.015.398.016.597.037.86.669.324.782 1.105 2.694 1.203 2.89.098.196.163.425.033.663-.13.238-.195.386-.386.592-.191.206-.402.46-.574.617-.191.175-.39.364-.167.714.223.35.991 1.634 2.127 2.647 1.461 1.302 2.693 1.707 3.076 1.9.384.191.608.16.832-.098.223-.257.956-1.116 1.21-1.5.255-.384.51-.32.86-.191.35.13 2.222 1.048 2.605 1.24.383.19.638.287.733.446.095.16.095.917-.202 1.752z" />
            </svg>
          </button>

          <button
            onClick={() => handleShare('gmail')}
            className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <Mail className="w-8 h-8 text-white" />
          </button>

          <button
            onClick={() => handleShare('telegram')}
            className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="white">
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm7.303 9.957l-2.364 11.146c-.178.807-.648 1.006-1.313.627l-3.628-2.673-1.749 1.684c-.194.194-.356.356-.73.356l.26-3.698 6.728-6.08c.292-.26-.064-.405-.455-.145l-8.314 5.235-3.583-1.12c-.779-.244-.794-.779.162-1.153l14.006-5.398c.648-.244 1.215.145 1.005 1.153z" />
            </svg>
          </button>
        </div>

        {/* Close Button */}
        <Button
          onClick={() => onOpenChange(false)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-6 text-lg"
        >
          {t('common.close')}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
