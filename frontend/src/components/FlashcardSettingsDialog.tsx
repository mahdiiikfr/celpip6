import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { BarChart2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type FlashcardMode = 'en_fa' | 'fa_en' | 'en_en';

interface FlashcardSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FlashcardMode;
  setMode: (mode: FlashcardMode) => void;
  hideOptions: boolean;
  setHideOptions: (hide: boolean) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  onAddWordsClick: () => void;
  onShowLeitnerChart: () => void;
  leitnerOrderPreserved: boolean;
  setLeitnerOrderPreserved: (preserved: boolean) => void;
}

export default function FlashcardSettingsDialog({
  open,
  onOpenChange,
  mode,
  setMode,
  hideOptions,
  setHideOptions,
  fontSize,
  setFontSize,
  onAddWordsClick,
  onShowLeitnerChart,
  leitnerOrderPreserved,
  setLeitnerOrderPreserved,
}: FlashcardSettingsDialogProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs w-[calc(100%-2rem)] rounded-3xl p-5" dir={isRtl ? "rtl" : "ltr"}>

        {/* Header Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
           {/* Add Words */}
           <Button
             variant="outline"
             onClick={() => { onOpenChange(false); onAddWordsClick(); }}
             className="h-12 border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 rounded-xl"
           >
             <Plus className="w-4 h-4" />
             {t('leitner.stats.newWords')}
           </Button>

           {/* Leitner Chart */}
           <Button
             variant="outline"
             onClick={() => { onOpenChange(false); onShowLeitnerChart(); }}
             className="w-full h-12 border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 rounded-xl"
           >
             <BarChart2 className="w-4 h-4" />
             {t('leitner.stats.chart')}
           </Button>
        </div>

        <div className="space-y-6">

            {/* Mode Selection */}
            <RadioGroup
                value={mode}
                onValueChange={(val) => setMode(val as FlashcardMode)}
                className="space-y-3"
            >
                <div className="flex items-center justify-between space-x-2 space-x-reverse">
                    <Label htmlFor="fa_en" className="text-gray-700 font-medium">{t('flashcard.settings.faToEn')}</Label>
                    <RadioGroupItem value="fa_en" id="fa_en" className="text-blue-600 border-blue-400" />
                </div>
                <div className="flex items-center justify-between space-x-2 space-x-reverse">
                    <Label htmlFor="en_fa" className="text-gray-700 font-medium">{t('flashcard.settings.enToFa')}</Label>
                    <RadioGroupItem value="en_fa" id="en_fa" className="text-blue-600 border-blue-400" />
                </div>
                <div className="flex items-center justify-between space-x-2 space-x-reverse">
                    <Label htmlFor="en_en" className="text-gray-700 font-medium">{t('flashcard.settings.enToEn')}</Label>
                    <RadioGroupItem value="en_en" id="en_en" className="text-blue-600 border-blue-400" />
                </div>
            </RadioGroup>

            {/* Hide Options Switch */}
            <div className="flex items-center justify-between pt-2">
                <Label htmlFor="hide-options" className="text-gray-700 font-medium">{t('flashcard.settings.hideOptions')}</Label>
                <Switch
                    id="hide-options"
                    checked={hideOptions}
                    onCheckedChange={setHideOptions}
                    dir="ltr"
                />
            </div>

             {/* Preserve Leitner Order Switch */}
            <div className="flex items-center justify-between pt-2">
                <Label htmlFor="leitner-order" className="text-gray-700 font-medium">{t('flashcard.settings.keepOrder')}</Label>
                <Switch
                    id="leitner-order"
                    checked={leitnerOrderPreserved}
                    onCheckedChange={setLeitnerOrderPreserved}
                    dir="ltr"
                />
            </div>

            {/* Font Size Slider */}
            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                    <Label className="text-gray-700 font-medium">{t('flashcard.settings.fontSize')}</Label>
                    <span className="text-sm text-gray-500">{fontSize}</span>
                </div>
                <Slider
                    value={[fontSize]}
                    onValueChange={(vals) => setFontSize(vals[0])}
                    min={14}
                    max={30}
                    step={1}
                    className="[&>.relative>.absolute]:bg-blue-500"
                />
                 <div className="flex justify-between items-center px-1">
                     <Button variant="outline" size="sm" onClick={() => setFontSize(20)} className="h-8 text-xs text-blue-600 border-blue-200">
                         {t('flashcard.settings.defaultSize')}
                     </Button>
                </div>
            </div>

            {/* Save Button */}
            <Button onClick={() => onOpenChange(false)} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg mt-2">
                {t('leitner.settings.save')}
            </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
