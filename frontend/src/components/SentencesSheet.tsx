import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { useTranslation } from 'react-i18next';
import { getSentencesWithWords, SentenceWordModel } from '@/lib/gptService';

interface SentencesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  words: string[];
}

export default function SentencesSheet({
  open,
  onOpenChange,
  words,
}: SentencesSheetProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [sentences, setSentences] = useState<SentenceWordModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open && words.length > 0) {
      const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
          const data = await getSentencesWithWords(words);
          if (data && Array.isArray(data)) {
            setSentences(data);
          } else {
            setSentences([]);
          }
        } catch (err) {
          console.error(err);
          setError(true);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [open, words]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl h-[85vh] p-0 flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 [&>button]:hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header - Yellow Background */}
        <div className="flex-none bg-amber-400 p-4 flex items-center justify-between rounded-t-3xl">
           {/* Spacer to balance the close button on the other side */}
           <div className="w-8" />

          <SheetTitle className="text-gray-900 text-lg font-bold">
            مرور کلمات در جملات واقعی
          </SheetTitle>

           <button
             onClick={() => onOpenChange(false)}
             className="p-1 hover:bg-black/10 rounded-full transition-colors"
           >
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">{t('common.loading', { defaultValue: 'Loading...' })}</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-red-500">Error loading sentences.</p>
               <button
                 onClick={() => {
                     setLoading(true);
                     setError(false);
                     getSentencesWithWords(words)
                        .then((data) => {
                             if (Array.isArray(data)) setSentences(data);
                             else setSentences([]);
                        })
                        .catch(() => setError(true))
                        .finally(() => setLoading(false));
                 }}
                 className="text-blue-500 underline"
               >
                 Retry
               </button>
            </div>
          ) : sentences.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full">
               <p className="text-gray-500">No sentences found.</p>
             </div>
          ) : (
            <div className="space-y-8">
              {sentences.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="text-gray-900 dark:text-gray-100 text-left text-lg font-medium leading-relaxed" dir="ltr">
                    {item.sentence}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-right text-lg leading-relaxed" dir="rtl">
                    {item.translation}
                  </p>
                  {/* Separator only if not last item */}
                  {/* idx < sentences.length - 1 && (
                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-4" />
                  ) */}
                  {/* Actually, user might appreciate whitespace more than lines. I'll leave plenty of space (space-y-8) */}
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
