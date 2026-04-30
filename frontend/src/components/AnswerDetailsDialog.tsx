import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Word } from '@/types/book';
import { Star, Volume2 } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { useTranslation } from 'react-i18next';

interface AnswerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: Word | null;
  onNext: () => void;
  isInitiallyStarred: boolean;
  onToggleFavorite: () => Promise<void>;
  playPronunciation: (text: string | undefined, accent: 'en-US' | 'en-GB') => void;
  currentSpeed: number;
  onSpeedChange: () => void;
  onSeeMoreClick: () => void;
  fontSize?: number;
}

export default function AnswerDetailsDialog({
  open,
  onOpenChange,
  word,
  onNext,
  isInitiallyStarred,
  onToggleFavorite,
  playPronunciation,
  currentSpeed,
  onSpeedChange,
  onSeeMoreClick,
  fontSize = 20,
}: AnswerDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  const [isStarred, setIsStarred] = useState(isInitiallyStarred);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  useEffect(() => {
    setIsStarred(isInitiallyStarred);
  }, [isInitiallyStarred, word?.wordID]);

  const handleToggleFavorite = useCallback(async () => {
    if (isTogglingFavorite) return;
    setIsTogglingFavorite(true);
    const newState = !isStarred;
    setIsStarred(newState);
    try {
      await onToggleFavorite();
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      setIsStarred(!newState);
    } finally {
        setIsTogglingFavorite(false);
    }
  }, [isStarred, onToggleFavorite, isTogglingFavorite]);


  if (!word) return null;

  const pronunciations = word.pronun?.split('\n') || [word.pronun];
  // Using dateOfLastExam as English definition per request
  const englishDefinition = word.dateOfLastExam || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] mx-auto rounded-3xl p-0 overflow-hidden shadow-lg border-none bg-white dark:bg-gray-900" dir={i18n.dir()}>

        {/* --- Top Control Bar --- */}
        <div className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50">
           {/* Left/Right depending on dir: Pronunciation Buttons */}
           <div className="flex gap-2" dir="ltr">
                <Button
                    size="sm"
                    onClick={() => playPronunciation(word.word, 'en-US')}
                    className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-3 h-9 gap-2 rounded-full shadow-sm"
                >
                    🇺🇸 US <Volume2 className="w-4 h-4" />
                </Button>
                <Button
                    size="sm"
                    onClick={() => playPronunciation(word.word, 'en-GB')}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 h-9 gap-2 rounded-full shadow-sm"
                >
                    🇬🇧 UK <Volume2 className="w-4 h-4" />
                </Button>
            </div>

            {/* Other side: Star and Speed */}
            <div className="flex items-center gap-3">
                 <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleFavorite}
                    disabled={isTogglingFavorite}
                    className="text-gray-400 hover:text-amber-500 w-8 h-8"
                >
                    <Star className={cn("w-6 h-6 transition-colors duration-200", isStarred ? 'text-amber-400 fill-amber-400' : 'text-gray-300')} />
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onSpeedChange}
                    className="text-xs font-semibold px-2 h-8 min-w-[3rem] border-gray-200 bg-white rounded-full text-blue-500 shadow-sm"
                >
                    x{currentSpeed}
                </Button>
            </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="px-6 py-4 space-y-4 text-center">
            {/* Word */}
            <h2
                className="font-bold text-gray-900 dark:text-white"
                dir="ltr"
                style={{ fontSize: `${fontSize + 4}px` }} // slightly larger than base
            >
                {word.word}
            </h2>

            {/* Pronunciation(s) */}
            {pronunciations.map((pron, index) => (
                 <p key={index} className="text-gray-500 dark:text-gray-400 font-mono text-sm" dir="ltr">{pron}</p>
            ))}

            {/* Persian Meaning */}
             <p
                className="text-purple-600/80 dark:text-purple-300 font-medium pt-1"
                style={{ fontSize: `${fontSize}px` }}
             >
                {word.meaning}
             </p>

            {/* English Definition (from dateOfLastExam) */}
            {englishDefinition && (
                <div className="pt-2">
                     <p
                        className="text-gray-800 dark:text-gray-300 font-medium"
                        dir="ltr"
                        style={{ fontSize: `${fontSize - 2}px` }} // slightly smaller
                     >
                        {englishDefinition}
                     </p>
                </div>
            )}


            {/* Example English */}
            <p
                className="text-gray-900 dark:text-gray-200 pt-2 leading-relaxed font-medium"
                dir="ltr"
                style={{ fontSize: `${fontSize - 4}px` }}
            >
                {word.example}
            </p>

            {/* Example Persian */}
             <p
                className="text-purple-400/90 dark:text-purple-300 leading-relaxed pb-2"
                style={{ fontSize: `${fontSize - 4}px` }}
             >
                {word.exampleMeaning}
             </p>

            {/* See More... Link */}
            <button
                onClick={onSeeMoreClick}
                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium pt-1"
            >
                {t('common.viewDetails')}
            </button>
        </div>

        {/* --- Footer with Next Button --- */}
        <div className="p-6 pt-2 pb-8">
          <Button onClick={onNext} className="w-full bg-[#ff5a5f] hover:bg-[#ff4046] text-white h-12 text-lg rounded-2xl shadow-lg shadow-red-200">
             {t('daily.next')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
