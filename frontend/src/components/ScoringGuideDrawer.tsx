import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Users, Link, BookOpen, ClipboardCheck, Rocket, Sparkles } from 'lucide-react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface ScoringGuideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ScoringGuideDrawer({ open, onOpenChange }: ScoringGuideDrawerProps) {
  const { t } = useTranslation();

  const items = [
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: "دعوت دوستان",
      desc: "با دعوت هر دوست به زبان‌فلای، ۳۰۰ سکه امتیاز دریافت می‌کنی."
    },
    {
      icon: <Link className="w-6 h-6 text-gray-500" />,
      title: "زنجیره‌های یادگیری",
      desc: "با تکمیل هر زنجیره‌ی یادگیری، ۶ امتیاز آموزشی می‌گیری."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-blue-500" />,
      title: "درس روزانه",
      desc: "با تکمیل درس روزانه، ۳ امتیاز آموزشی دریافت می‌کنی."
    },
    {
      icon: <ClipboardCheck className="w-6 h-6 text-blue-500" />,
      title: "نظرسنجی‌ها",
      desc: "با شرکت در هر نظرسنجی، ۱ امتیاز آموزشی می‌گیری."
    },
    {
      icon: <Rocket className="w-6 h-6 text-red-500" />,
      title: "کاربرد امتیازها",
      desc: "از امتیازها می‌تونی برای باز کردن محتوای آموزشی جدید و خرید کتاب‌ها استفاده کنی."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
      title: "امکانات بیشتر",
      desc: "به‌زودی روش‌ها و امکانات جدیدتری برای کسب امتیاز به زبان‌فلای اضافه می‌شه."
    }
  ];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="h-[85vh] rounded-t-[30px] bg-white dark:bg-gray-900 border-t-0 outline-none p-0 overflow-hidden flex flex-col">
        <VisuallyHidden.Root>
          <DrawerTitle>{t('scoring.title', { defaultValue: 'راهنمای امتیازدهی' })}</DrawerTitle>
          <DrawerDescription>{t('scoring.desc', { defaultValue: 'راهنمای کسب امتیاز در زبان‌فلای' })}</DrawerDescription>
        </VisuallyHidden.Root>

        {/* Header - Yellow Background */}
        <div className="w-full bg-amber-500 py-4 flex items-center justify-center relative shrink-0">
          <div className="absolute top-2 w-16 h-1.5 rounded-full bg-white/30" />
          <h2 className="text-xl font-bold text-gray-900 mt-2">
            {t('scoring.header', { defaultValue: 'راهنمای امتیازدهی' })}
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto w-full relative p-6">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-yellow-500 text-xl">✨</span>
            <h3 className="text-blue-600 font-bold text-lg text-right w-full">
              {t('scoring.subHeader', { defaultValue: 'راهنمای امتیازدهی زبان‌فلای' })}
            </h3>
          </div>

          <div className="space-y-8 pb-8">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col gap-2 items-end text-right">
                <div className="flex items-center gap-2 flex-row-reverse w-full">
                  {item.icon}
                  <h4 className="font-bold text-blue-600 text-base">{item.title}</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed font-medium pr-8" dir="rtl">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
