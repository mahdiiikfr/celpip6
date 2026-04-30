import { Trophy, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { DayStats } from '@/lib/activity';
import { useTranslation } from 'react-i18next';

interface DayStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  stats: DayStats | null;
}

export default function DayStatsDialog({
  open,
  onOpenChange,
  date,
  stats,
}: DayStatsDialogProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  if (!stats) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl w-[calc(100%-2rem)] mx-auto p-0 bg-transparent border-0"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t('stats.dayStats')}</DialogTitle>
          <DialogDescription>
            {t('stats.learningStats')}
          </DialogDescription>
        </DialogHeader>

        {/* Header with Date */}
        <div className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-t-3xl p-6 relative">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 left-4 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h2 className="text-center text-white text-2xl font-bold font-mono" dir="ltr">{date}</h2>
        </div>

        {/* Content */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 rounded-b-3xl p-4 md:p-6 overflow-y-auto max-h-[70vh]">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left Side - Stats Breakdown */}
            <div className="flex-1 space-y-4">

              {/* Word Stats Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-center text-lg mb-4 text-gray-800 dark:text-gray-100 font-bold">{t('stats.wordStats')}</h3>
                <div className="flex justify-between items-center px-4">
                  <div className="text-center">
                    <p className="text-red-500 mb-1 font-bold">{stats.totalWrong}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('stats.wrong')}</p>
                    <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-green-500 mb-1 font-bold">{stats.totalCorrect}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('stats.correct')}</p>
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown (Based on Screenshot) */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-sm space-y-3">
                  <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">{t('stats.scoreCorrect', { count: stats.totalCorrect })}</span>
                      <span className="font-bold text-green-600 ltr">+{ (stats.totalCorrect * 1.5).toFixed(1) }</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-300">{t('stats.scoreWrong', { count: stats.totalWrong })}</span>
                      <span className="font-bold text-red-600 ltr">-{ (stats.totalWrong * 0.3).toFixed(1) }</span>
                  </div>
                  {stats.accuracyBonus > 0 && (
                     <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">{t('stats.bonusAccuracy', { percent: stats.accuracy })}</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400 ltr">+{ stats.accuracyBonus.toFixed(1) }</span>
                     </div>
                  )}
                  {stats.activityBonus > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">{t('stats.bonusActivity', { count: stats.totalAnswers })}</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400 ltr">+{ stats.activityBonus.toFixed(1) }</span>
                      </div>
                  )}
                   {stats.bookBonus > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">{t('stats.bonusBook', { count: stats.uniqueBooks })}</span>
                        <span className="font-bold text-amber-600 dark:text-amber-400 ltr">+{ stats.bookBonus.toFixed(1) }</span>
                      </div>
                  )}
                  {stats.progressBonus > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-300">{t('stats.scoreProgress')}</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400 ltr">+{ stats.progressBonus.toFixed(1) }</span>
                      </div>
                  )}
              </div>

              {/* Accuracy and Total Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-pink-500 mb-1 text-sm font-bold">{t('stats.accuracy')}</p>
                  <p className="text-gray-800 dark:text-gray-200 font-bold ltr">%{stats.accuracy}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-purple-500 mb-1 text-sm font-bold">{t('stats.totalQuestions')}</p>
                  <p className="text-gray-800 dark:text-gray-200 font-bold">{stats.totalAnswers}</p>
                </div>
              </div>
            </div>

            {/* Right Side - Trophy & Final Score */}
            <div className="w-full md:w-56 shrink-0">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl p-6 shadow-xl text-center h-full flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-white/10 rotate-12 scale-150 transform origin-bottom-right"></div>
                <div className="mb-4 relative z-10">
                  <Trophy className="w-20 h-20 text-yellow-300 mx-auto drop-shadow-lg filter" style={{filter: 'drop-shadow(0 0 10px rgba(255,255,0,0.5))'}} />
                </div>
                <h3 className="text-white/90 text-lg mb-2 font-bold relative z-10">{t('stats.finalScore')}</h3>
                <p className="text-white text-5xl font-extrabold relative z-10 font-mono tracking-tighter">{stats.finalScore}</p>

                <div className="mt-4 pt-4 border-t border-white/20 w-full relative z-10">
                   <p className="text-xs text-white/80">{t('stats.performanceLevel')}</p>
                   <p className="text-lg font-bold mt-1">Level {stats.level === 0 ? '-' : stats.level}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
