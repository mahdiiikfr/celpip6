import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { Drawer } from 'vaul';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

export interface ReadingResultItem {
    question: string;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
}

interface CelpipReadingResultDialogProps {
    isOpen: boolean;
    onClose: () => void;
    score: number;
    totalQuestions: number;
    results: ReadingResultItem[];
}

export default function CelpipReadingResultDialog({
    isOpen,
    onClose,
    score,
    totalQuestions,
    results
}: CelpipReadingResultDialogProps) {
    const { t } = useTranslation();

    return (
        <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Drawer.Content className="bg-white dark:bg-gray-900 flex flex-col rounded-t-[10px] h-[90vh] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none">

                    {/* Accessibility: Visually Hidden Title and Description */}
                    <VisuallyHidden>
                        <Drawer.Title>{t('celpip.result_title', 'Test Results')}</Drawer.Title>
                        <Drawer.Description>{t('celpip.result_description', 'Your reading test results and score.')}</Drawer.Description>
                    </VisuallyHidden>

                    {/* Header */}
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-t-[10px] flex-shrink-0 border-b border-gray-200 dark:border-gray-800">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 dark:bg-gray-700 mb-6" />
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {t('celpip.result_title', 'Test Results')}
                            </h2>
                            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Score Card */}
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-xl flex flex-col items-center justify-center mt-2">
                            <span className="text-sm font-medium text-amber-800 dark:text-amber-200 uppercase tracking-wider">
                                {t('celpip.your_score', 'Your Score')}
                            </span>
                            <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                {score} <span className="text-xl text-amber-500/60 dark:text-amber-400/60">/ {totalQuestions}</span>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {results.map((item, index) => (
                            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                <p className="font-bold text-gray-800 dark:text-white mb-3 text-sm leading-relaxed">
                                    {item.question}
                                </p>

                                <div className="space-y-2">
                                    {/* User Answer */}
                                    <div className={`p-3 rounded-lg flex items-start gap-3 border ${
                                        item.isCorrect
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                    }`}>
                                        {item.isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <span className="text-xs font-semibold uppercase block mb-0.5 text-gray-500 dark:text-gray-400">
                                                {t('celpip.your_answer', 'Your Answer')}
                                            </span>
                                            <span className={`font-medium text-sm ${
                                                item.isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                                            }`}>
                                                {item.userAnswer === "-" ? t('celpip.no_answer', 'No Answer') : item.userAnswer}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Correct Answer (Only show if user was wrong) */}
                                    {!item.isCorrect && (
                                        <div className="p-3 rounded-lg flex items-start gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                            <CheckCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <span className="text-xs font-semibold uppercase block mb-0.5 text-gray-500 dark:text-gray-400">
                                                    {t('celpip.correct_answer', 'Correct Answer')}
                                                </span>
                                                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
                                                    {item.correctAnswer}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
