// src/components/BookSectionDialog.tsx

import { Book, Mic, FileText, BookOpen, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

interface BookSectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookTitle: string;
  onSelectSection: (section: string) => void;
  // پراپرتی جدید برای فراخوانی تابع حذف
  onDelete: () => void;
  bookId: string;
}

export default function BookSectionDialog({
  open,
  onOpenChange,
  bookTitle,
  onSelectSection,
  onDelete, // استفاده از پراپرتی جدید
  bookId,
}: BookSectionDialogProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  const sections = [
    { id: 'flashcard', title: t('bookSection.flashcard'), icon: FileText, bgColor: 'bg-pink-200 dark:bg-pink-900' },
    { id: 'reading', title: t('bookSection.reading'), icon: Book, bgColor: 'bg-blue-200 dark:bg-blue-900' },
    { id: 'spelling', title: t('bookSection.spelling'), icon: BookOpen, bgColor: 'bg-purple-200 dark:bg-purple-900' },
    { id: 'pronunciation', title: t('bookSection.pronunciation'), icon: Mic, bgColor: 'bg-green-200 dark:bg-green-900' },
  ];

  const handleSectionClick = (sectionId: string) => {
    onSelectSection(sectionId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm w-[calc(100%-2rem)] mx-auto bg-white dark:bg-gray-800 rounded-3xl p-0"
        dir={isRtl ? "rtl" : "ltr"}
      >
        <DialogHeader>
          <div className="bg-gradient-to-r from-amber-400 to-amber-500 pt-5 pb-4 px-4 rounded-t-3xl">
            <DialogTitle className="text-center text-white text-base font-bold leading-tight">
              {bookTitle || t('bookSection.selectSection')}
            </DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            {t('bookSection.selectPrompt')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <p className="text-center text-gray-700 dark:text-gray-200 mb-6 text-sm" dir={isRtl ? "rtl" : "ltr"}>
            {t('bookSection.selectPrompt')}؟
          </p>
          <div className="grid grid-cols-2 gap-4">
            {sections.map((section) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`${section.bgColor} text-gray-800 dark:text-gray-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:scale-105 transition-transform shadow-md`}
                >
                  <IconComponent className="w-10 h-10" />
                  <span className="text-lg">{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ====== دکمه حذف در پایین دیالوگ اضافه شده است ====== */}
        <DialogFooter className="p-6 pt-0">
            <Button variant="destructive" onClick={onDelete} className="w-full">
                <Trash2 className="w-4 h-4 ml-2" />
                {t('bookSection.deleteBook')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
