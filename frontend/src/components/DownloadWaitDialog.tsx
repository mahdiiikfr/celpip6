import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Progress } from "@/components/ui/progress";
import { Check, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/components/ui/utils';

interface DownloadWaitDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    status: 'idle' | 'confirming' | 'downloading' | 'decrypting' | 'parsing' | 'saving' | 'error';
}

export default function DownloadWaitDialog({
    open,
    onOpenChange,
    status
}: DownloadWaitDialogProps) {
    const { t } = useTranslation();

    // Internal State for Simulation
    const [progress, setProgress] = useState(0);
    const [speed, setSpeed] = useState('0 MB/s');
    const [timeLeft, setTimeLeft] = useState('0s');
    const simulationRef = useRef<NodeJS.Timeout | null>(null);

    // Simulate Progress
    useEffect(() => {
        // Reset on open
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setProgress(0);
            return;
        }

        if (status === 'downloading') {
            setProgress(0);
            setSpeed('1.2 MB/s');
            setTimeLeft('3 ثانیه');

            let currentProgress = 0;
            const targetDuration = 3000; // 3 seconds
            const intervalTime = 100; // update every 100ms
            const steps = targetDuration / intervalTime;
            const increment = 95 / steps; // Go up to 95%

            simulationRef.current = setInterval(() => {
                currentProgress += increment;

                // Randomize speed slightly for realism
                const randomSpeed = (Math.random() * (3.5 - 1.5) + 1.5).toFixed(1);
                setSpeed(`${randomSpeed} MB/s`);

                // Update time left
                const remainingPercent = 95 - currentProgress;
                const remainingTime = Math.ceil((remainingPercent / 95) * 3);
                setTimeLeft(`${remainingTime} ثانیه`);

                if (currentProgress >= 95) {
                    currentProgress = 95;
                    setTimeLeft('...');
                    // Stop incrementing but keep loop to maintain "active" feel or just clear
                    if (simulationRef.current) clearInterval(simulationRef.current);
                }
                setProgress(currentProgress);
            }, intervalTime);
        } else if (status === 'decrypting' || status === 'parsing' || status === 'saving') {
            // If we moved past downloading but are stuck in processing
            if (simulationRef.current) clearInterval(simulationRef.current);
            setProgress(98); // Hold at 98 for processing
            setSpeed('Processing...');
            setTimeLeft('...');
        }

        return () => {
            if (simulationRef.current) clearInterval(simulationRef.current);
        };
    }, [open, status, t]);

    const isDownloadActive = ['downloading', 'decrypting', 'parsing', 'saving'].includes(status);

    return (

        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[90%] max-w-sm mx-auto p-0 bg-white dark:bg-gray-800 rounded-[20px] overflow-hidden border-none shadow-2xl"
                aria-describedby="download-dialog-desc"
                hideClose
                onInteractOutside={(e) => {
                    if (isDownloadActive) e.preventDefault();
                }}
            >
                {/* Yellow Header */}
                <div className="bg-[#FFAA00] flex justify-between items-center px-4 py-3">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="text-black/80 hover:text-black transition-colors"
                        disabled={!isDownloadActive}
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                    <span className="text-black font-bold text-sm">در حال دانلود...</span>
                    <div className="w-6"></div> {/* Spacer to center title */}
                </div>

                {status === 'error' ? (
                    <div className="p-6 flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <DialogTitle className="text-center text-xl">{t('dialogs.downloadError.title')}</DialogTitle>
                        <DialogDescription id="download-dialog-desc" className="text-center mt-2">
                            {t('dialogs.downloadError.description')}
                        </DialogDescription>
                        <div className="mt-6 w-full flex gap-3">
                            <Button onClick={() => onOpenChange(false)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-6 font-medium text-base">
                                {t('dialogs.downloadError.button', 'تلاش مجدد')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <DialogTitle className="sr-only">در حال دانلود</DialogTitle>
                        <DialogDescription id="download-dialog-desc" className="sr-only">وضعیت دانلود</DialogDescription>

                        {/* Progress Bar Container */}
                        <div className="mt-2 mb-6">
                            <div className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden" dir="rtl">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>

                            {/* File Size and Percentage */}
                            <div className="flex justify-between items-center mt-3" dir="ltr">
                                <span className="text-gray-500 text-[11px] font-medium tracking-wide">
                                    {(progress * 0.0608).toFixed(2)} MB / 6.08 MB
                                </span>
                                <span className="text-blue-500 text-sm font-bold">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4" dir="rtl">
                            <Button
                                onClick={() => onOpenChange(false)}
                                className="flex-1 bg-[#2196F3] hover:bg-blue-600 text-white rounded-2xl py-6 font-bold text-base shadow-sm"
                            >
                                توقف
                            </Button>
                            <Button
                                onClick={() => onOpenChange(false)}
                                className="flex-1 bg-[#FFAA00] hover:bg-amber-500 text-white rounded-2xl py-6 font-bold text-base shadow-sm"
                            >
                                لغو دانلود
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
