import { useState, useEffect } from 'react';
import { CheckCircle2, Loader2, HeadphonesIcon } from 'lucide-react';
import SuggestionsDialog from './SuggestionsDialog';

interface RestoreProgressFullScreenProps {
    isOpen: boolean;
    isTaskComplete: boolean;
    onComplete: () => void;
}

export default function RestoreProgressFullScreen({ isOpen, isTaskComplete, onComplete }: RestoreProgressFullScreenProps) {
    const [step, setStep] = useState(1);
    const [stepStatus, setStepStatus] = useState<'loading' | 'done'>('loading');
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setStepStatus('loading');
            return;
        }

        let isMounted = true;

        const processSteps = async () => {
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

            // Step 1
            if (!isMounted) return;
            setStep(1); setStepStatus('loading');
            await delay(1500);
            if (!isMounted) return;
            setStepStatus('done');
            await delay(500);

            // Step 2
            if (!isMounted) return;
            setStep(2); setStepStatus('loading');
            await delay(1500);
            if (!isMounted) return;
            setStepStatus('done');
            await delay(500);

            // Step 3
            if (!isMounted) return;
            setStep(3); setStepStatus('loading');
            await delay(1500);
            if (!isMounted) return;
            setStepStatus('done');
            await delay(500);

            // Step 4
            if (!isMounted) return;
            setStep(4); setStepStatus('loading');
            await delay(1500);
            if (!isMounted) return;
            setStepStatus('done');

            if (!isMounted) return;
            setStep(5);
        };

        processSteps();

        return () => {
            isMounted = false;
        };
    }, [isOpen]);

    useEffect(() => {
        if (step === 5 && isTaskComplete) {
            const timeoutId = setTimeout(() => {
                onComplete();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [step, isTaskComplete, onComplete]);

    if (!isOpen) return null;

    const steps = [
        { id: 1, loadingText: "دریافت اطلاعات کاربری", doneText: "اطلاعات کاربری با موفقیت دریافت شد" },
        { id: 2, loadingText: "دانلود کتاب‌های مورد نیاز", doneText: "با موفقیت دانلود شد" },
        { id: 3, loadingText: "ساخت فایل", doneText: "ساخت فایل با موفقیت انجام شد" },
        { id: 4, loadingText: "آپلود فایل", doneText: "آپلود فایل با موفقیت انجام شد" },
    ];

    return (
        <div className="fixed inset-0 z-40 bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-between transition-colors duration-300" dir="rtl">
            {/* Header */}
            <div className="w-full bg-white dark:bg-gray-900 shadow-sm py-4 px-6 flex items-center justify-center">
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">بازیابی اطلاعات</h1>
            </div>

            {/* Content / Steps */}
            <div className="flex-1 w-full max-w-sm px-6 py-12 flex flex-col gap-6 justify-center">
                {steps.map(s => {
                    const isActive = step === s.id;
                    const isPast = step > s.id;
                    const isFuture = step < s.id;

                    if (isFuture) return null;

                    const isDone = isPast || (isActive && stepStatus === 'done');

                    return (
                        <div key={s.id} className={`flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border ${isDone ? 'border-green-100 dark:border-green-900/30' : 'border-blue-100 dark:border-blue-900/30'} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}>
                            {isDone ? (
                                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 animate-in zoom-in" />
                            ) : (
                                <Loader2 className="w-6 h-6 text-blue-500 animate-spin flex-shrink-0" />
                            )}
                            <span className={`font-medium ${isDone ? 'text-green-700 dark:text-green-400' : 'text-blue-700 dark:text-blue-400'}`}>
                                {isDone ? s.doneText : s.loadingText}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="w-full p-6 pb-8">
                <button
                    onClick={() => setShowSuggestions(true)}
                    className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm active:scale-[0.98]"
                >
                    <HeadphonesIcon className="w-5 h-5" />
                    ارتباط با پشتیبانی
                </button>
            </div>

            <SuggestionsDialog open={showSuggestions} onClose={() => setShowSuggestions(false)} />
        </div>
    );
}
