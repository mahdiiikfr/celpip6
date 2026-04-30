import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface SessionSummaryDialogProps {
  open: boolean;
  stats: { correctAnswer: number; wrongAnswer: number } | null;
  onClose: () => void;
}

export default function SessionSummaryDialog({
  open,
  stats,
  onClose,
}: SessionSummaryDialogProps) {

  const correct = stats?.correctAnswer ?? 0;
  const wrong = stats?.wrongAnswer ?? 0;
  const total = correct + wrong;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Calculate circle stroke (circumference = 2 * PI * R)
  // R = 40, C = ~251
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-xs w-[calc(100%-2rem)] rounded-3xl p-0 overflow-hidden border-none shadow-xl" dir="rtl">

        {/* Header - Yellow/Amber per design */}
        <div className="bg-[#ffb400] p-4 text-center">
            <h2 className="text-xl font-bold text-gray-800">{t('tests.result')}</h2>
        </div>

        <div className="bg-white p-6 flex flex-col items-center gap-6">

            {/* Circular Progress */}
            <div className="relative w-32 h-32 flex items-center justify-center">
                 {/* Background Circle */}
                 <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="transparent"
                    />
                    <circle
                        cx="64"
                        cy="64"
                        r={radius}
                        stroke={percentage >= 50 ? "#10b981" : "#f59e0b"} // Green if passed, else amber
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                 </svg>
                 <span className="absolute text-2xl font-bold text-gray-700">{percentage}%</span>
            </div>

            {/* Stats Rows */}
            <div className="w-full space-y-3">
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                     <span className="text-green-600 font-bold text-lg">True</span>
                     <span className="text-gray-600 font-medium text-lg">{correct}</span>
                     <div className="bg-green-500 rounded-lg p-1">
                        <Check className="w-5 h-5 text-white" />
                     </div>
                </div>

                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                     <span className="text-red-500 font-bold text-lg">False</span>
                     <span className="text-gray-600 font-medium text-lg">{wrong}</span>
                     <div className="bg-red-500 rounded-lg p-1">
                        <X className="w-5 h-5 text-white" />
                     </div>
                </div>
            </div>

            {/* Close Button */}
            <Button
                onClick={onClose}
                className="w-full bg-[#ffb400] hover:bg-[#e5a200] text-gray-900 font-bold h-12 rounded-xl text-lg shadow-md"
            >
                {t('common.close')}
            </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
