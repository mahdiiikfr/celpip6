import React from 'react';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LeitnerStatusInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    level: number;
}

export default function LeitnerStatusInfoDialog({ open, onOpenChange, level }: LeitnerStatusInfoDialogProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    const getDialogContent = (level: number) => {
        switch (level) {
            case 1:
                return {
                    title: t('leitner.info.newTitle'),
                    description: t('leitner.info.newDesc'),
                };
            case 2:
                return {
                    title: t('leitner.status.step2'),
                    description: t('leitner.info.step2Desc', { defaultValue: isRtl ? "این کلمه رو یک‌بار درست جواب دادی. ۵ روز دیگه دوباره مرور میشه" : "You answered correctly once. Review in 5 days." }),
                };
            case 3:
                return {
                    title: t('leitner.status.step3'),
                    description: t('leitner.info.step3Desc', { defaultValue: isRtl ? "این کلمه رو دوبار پشت سر هم درست گفتی. ۱۰ روز دیگه مرور میشه" : "Correct twice in a row. Review in 10 days." }),
                };
            case 4:
                return {
                    title: t('leitner.status.step4'),
                    description: t('leitner.info.step4Desc', { defaultValue: isRtl ? "این کلمه رو سه‌بار متوالی درست جواب دادی. ۲۰ روز دیگه مرور میشه" : "Correct 3 times in a row. Review in 20 days." }),
                };
            case 5:
                return {
                    title: t('leitner.status.step5'),
                    description: t('leitner.info.step5Desc', { defaultValue: isRtl ? "فقط یک قدم مونده! ۳۰ روز دیگه مرور میشه و برای همیشه یاد می‌گیری" : "Just one step left! Review in 30 days to master it." }),
                };
            case 6:
                return {
                    title: t('leitner.info.masteredTitle'),
                    description: t('leitner.info.masteredDesc'),
                };
            default:
                 return {
                    title: t('leitner.info.newTitle'),
                    description: t('leitner.info.newDesc'),
                };
        }
    };

    const content = getDialogContent(level);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-[320px] sm:max-w-[380px] font-vazir" dir={isRtl ? "rtl" : "ltr"}>
                 <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-xl">
                    {/* Header with Icon */}
                    <div className="bg-[#fbbf24] h-20 flex items-center justify-center relative">
                        <MessageCircle className="w-10 h-10 text-black fill-current opacity-80" />
                    </div>

                    <div className="p-6 text-center space-y-4">
                         <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                             {content.title}
                         </h2>
                         <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                             {content.description}
                         </p>
                    </div>

                    <div className="p-6 pt-2">
                        <Button
                            onClick={() => onOpenChange(false)}
                            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-2xl h-12 text-lg font-medium"
                        >
                            {t('common.understood')}
                        </Button>
                    </div>
                 </div>
            </DialogContent>
        </Dialog>
    );
}
