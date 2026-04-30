import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogoutWarningDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onBackup: () => void;
}

export default function LogoutWarningDialog({
    open,
    onOpenChange,
    onBackup
}: LogoutWarningDialogProps) {
    const { t } = useTranslation();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent hideClose={true} className="max-w-[320px] w-full rounded-[32px] overflow-hidden p-0 border-0 shadow-2xl bg-white dark:bg-gray-900" aria-describedby="logout-warning-dialog-desc">
                {/* Header Section */}
                <div className="bg-amber-500 pt-8 pb-10 px-6 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <button
                            onClick={() => onOpenChange(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex justify-center mb-4 relative z-10">
                        <div className="bg-white/20 p-4 rounded-full">
                            <AlertTriangle className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="px-6 pt-6 pb-8 bg-white dark:bg-gray-900 -mt-6 rounded-t-3xl relative z-20 flex flex-col items-center">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {t('logoutWarning.title')}
                        </DialogTitle>
                        <DialogDescription id="logout-warning-dialog-desc" className="sr-only">
                            {t('logoutWarning.title')}
                        </DialogDescription>
                    </DialogHeader>

                    {/* Actions */}
                    <div className="w-full space-y-3 mt-4">
                        <Button
                            onClick={onBackup}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-6 rounded-2xl text-base shadow-sm"
                        >
                            {t('logoutWarning.backup')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold py-6 rounded-2xl text-base"
                        >
                            {t('logoutWarning.close')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
