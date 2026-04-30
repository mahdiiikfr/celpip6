import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils';
import { useTranslation } from 'react-i18next';

interface NewWordsCountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    availableCount: number | null;
    defaultCount: number;
    onConfirm: (count: number, skipFuture: boolean) => void;
    isLoadingCount: boolean;
    onCancel: () => void;
}

export default function NewWordsCountDialog({
    open,
    onOpenChange,
    availableCount,
    defaultCount,
    onConfirm,
    isLoadingCount,
    onCancel
}: NewWordsCountDialogProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const [count, setCount] = useState<number>(defaultCount);
    const [customCount, setCustomCount] = useState<string>('');
    const [skip, setSkip] = useState(false);

    // Reset state when dialog opens
    useEffect(() => {
        if (open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCount(defaultCount);
            setCustomCount('');
        }
    }, [open, defaultCount]);

    // Update count when custom input changes
    const handleCustomChange = (val: string) => {
        setCustomCount(val);
        const num = parseInt(val, 10);
        if (!isNaN(num) && num > 0) {
            setCount(num);
        }
    };

    const handleSave = () => {
        // Validation: Ensure we don't request more than available
        const finalCount = Math.min(count, availableCount || count);
        onConfirm(finalCount, skip);
    };

    const PRESETS = [20, 40, 60, 80];

    // Calculate days remaining
    // If availableCount is null/0, avoid division by zero
    const daysRemaining = (availableCount && count > 0)
        ? Math.ceil(availableCount / count)
        : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-sm w-[90%] sm:w-full mx-auto" dir={isRtl ? "rtl" : "ltr"}>
                <DialogTitle className="sr-only">{t('leitner.settings.title')}</DialogTitle>
                <DialogDescription className="sr-only">{t('leitner.settings.newWordsCount')}</DialogDescription>
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-xl">
                    {/* Header */}
                    <div className="bg-amber-500 py-6 px-4 text-center">
                        <h2 className="text-white text-lg font-medium">
                            {t('leitner.settings.newWordsCount')}
                        </h2>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Preset Buttons */}
                        <div className="space-y-3">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => {
                                        setCount(preset);
                                        setCustomCount(''); // Clear custom if preset selected
                                    }}
                                    className={cn(
                                        "w-full py-3 rounded-full text-lg transition-colors font-medium border-2",
                                        count === preset && !customCount
                                            ? "bg-[#4CAF50] text-white border-[#4CAF50] shadow-md"
                                            : "bg-[#E8F5E9] dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-[#E8F5E9] dark:border-gray-600 hover:bg-[#C8E6C9] dark:hover:bg-gray-600"
                                    )}
                                >
                                    {preset.toLocaleString(i18n.language === 'fa' ? 'fa-IR' : 'en-US')} {t('leitner.status.default')}
                                </button>
                            ))}
                        </div>

                        {/* Custom Input */}
                        <div className="relative">
                            <input
                                type="number"
                                value={customCount}
                                onChange={(e) => handleCustomChange(e.target.value)}
                                placeholder={t('leitner.settings.customCount')}
                                className={cn(
                                    "w-full text-center py-3 rounded-full border-2 text-lg outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500",
                                    customCount
                                        ? "border-[#4CAF50] text-gray-800 dark:text-white bg-white dark:bg-gray-700"
                                        : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:border-amber-400"
                                )}
                            />
                        </div>

                        {/* Prediction Text */}
                        <div className="text-center px-2 min-h-[3rem] flex items-center justify-center">
                            <p className="text-gray-800 dark:text-gray-200 text-sm leading-6">
                                {t('leitner.settings.reviewEstimate', { days: daysRemaining.toLocaleString(i18n.language === 'fa' ? 'fa-IR' : 'en-US') })}
                            </p>
                        </div>

                        {/* Don't Show Again */}
                        <div className="flex items-center justify-center gap-2 pt-2">
                             {/* Custom Circle Checkbox */}
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <span className="text-sm text-gray-800 dark:text-gray-200 font-medium">{t('leitner.settings.dontShowAgain')}</span>
                                <div className="relative w-6 h-6">
                                    <input
                                        type="checkbox"
                                        className="peer appearance-none w-6 h-6 border-2 border-blue-500 rounded-full checked:bg-blue-500 transition-colors"
                                        checked={skip}
                                        onChange={(e) => setSkip(e.target.checked)}
                                    />
                                    <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </label>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={isLoadingCount}
                                className="w-full bg-[#2979FF] hover:bg-[#2962FF] text-white rounded-full py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                            >
                                {t('leitner.settings.save')}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
