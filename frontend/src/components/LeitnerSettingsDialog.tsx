import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose // Import DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toEnglishDigits } from '@/lib/convertNumbers'; // Import the converter
import { useTranslation } from 'react-i18next';

const LEITNER_NEW_WORDS_KEY = 'leitnerNewWords';
const LEITNER_DONT_SHOW_AGAIN_KEY = 'leitnerDontShowAgain';

interface LeitnerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onSave is removed as we save directly to localStorage
}

export default function LeitnerSettingsDialog({ open, onOpenChange }: LeitnerSettingsDialogProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    // State for the selected option (preset value or 'custom')
    const [selectedOption, setSelectedOption] = useState<string>('20');
    // State for the custom input value
    const [customValue, setCustomValue] = useState<string>('');
    // State for the "don't show again" checkbox
    const [dontShowAgain, setDontShowAgain] = useState(false);

    // Load initial settings from localStorage when the dialog opens
    useEffect(() => {
        if (open) {
            const storedValue = localStorage.getItem(LEITNER_NEW_WORDS_KEY);
            const storedDontShow = localStorage.getItem(LEITNER_DONT_SHOW_AGAIN_KEY) === 'true';

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDontShowAgain(storedDontShow);

            if (storedValue) {
                const numValue = parseInt(storedValue, 10);
                // Check if the stored value is one of the presets
                if (['20', '40', '60', '80'].includes(storedValue)) {
                    setSelectedOption(storedValue);
                    setCustomValue(''); // Clear custom value if a preset is selected
                } else if (!isNaN(numValue)) {
                    // It's a custom value
                    setSelectedOption('custom');
                    setCustomValue(storedValue);
                } else {
                    // Default if stored value is invalid
                    setSelectedOption('20');
                    setCustomValue('');
                }
            } else {
                 // Default if nothing is stored
                setSelectedOption('20');
                setCustomValue('');
            }
        }
    }, [open]);

    const handleSave = () => {
        let valueToSave: number;

        if (selectedOption === 'custom') {
            const englishDigits = toEnglishDigits(customValue);
            const numValue = parseInt(englishDigits, 10);
            // Validate custom input: must be a positive integer
            if (isNaN(numValue) || numValue <= 0) {
                alert(t('leitner.settings.invalidCount'));
                return; // Prevent saving invalid input
            }
            valueToSave = numValue;
        } else {
            valueToSave = parseInt(selectedOption, 10);
        }

        // Save the chosen number of words
        localStorage.setItem(LEITNER_NEW_WORDS_KEY, valueToSave.toString());

        // Save the "don't show again" preference
        if (dontShowAgain) {
            localStorage.setItem(LEITNER_DONT_SHOW_AGAIN_KEY, 'true');
        } else {
            // Optionally remove the key if unchecked, or set to 'false'
            localStorage.removeItem(LEITNER_DONT_SHOW_AGAIN_KEY);
        }

        console.log(`Settings saved: New words = ${valueToSave}, Don't show again = ${dontShowAgain}`);
        onOpenChange(false); // Close the dialog
    };

    // Handle changes in the custom input
    const handleCustomInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
         // Allow only digits (using the converter function implicitly)
         const englishValue = toEnglishDigits(value);
         if (/^\d*$/.test(englishValue)) {
            setCustomValue(englishValue);
            setSelectedOption('custom'); // Automatically select 'custom' when typing
         }
    };

    const presetOptions = ['20', '40', '60', '80'];

    const getDaysEstimate = () => {
         // Placeholder calculation or fixed text logic.
         // Assuming fixed "46" for now as per original code, or dynamic based on `selectedOption` if needed.
         // Let's keep it simple or dynamic if we knew total words.
         return '46';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm w-[calc(100%-2rem)] mx-auto rounded-xl p-0 bg-white dark:bg-gray-800" dir={isRtl ? "rtl" : "ltr"}>
                <DialogHeader className="bg-gradient-to-r from-amber-400 to-amber-500 p-4 rounded-t-xl">
                    <DialogTitle className="text-center text-white text-lg">{t('leitner.settings.title')}</DialogTitle>
                    <DialogDescription className="text-center text-amber-100 text-sm mt-1">
                        {t('leitner.settings.newWordsCount')}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center pb-2">
                         {t('leitner.settings.reviewEstimate', { days: getDaysEstimate() })}
                    </p>
                    {/* Preset Options */}
                    <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                        {presetOptions.map((option) => (
                            <Button
                                key={option}
                                variant={selectedOption === option ? "default" : "secondary"}
                                className={`w-full justify-center py-3 text-base ${
                                    selectedOption === option
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                                }`}
                                onClick={() => { setSelectedOption(option); setCustomValue('');}} // Clear custom on preset click
                            >
                                {option} {t('leitner.status.default')}
                                <RadioGroupItem value={option} id={`option-${option}`} className="sr-only" /> {/* Hidden for accessibility */}
                            </Button>
                        ))}
                    </RadioGroup>

                    {/* Custom Input */}
                    <div className="relative">
                         <Label htmlFor="custom-input" className="sr-only">{t('leitner.settings.customCount')}</Label>
                        <Input
                            id="custom-input"
                            type="tel" // Use tel for numeric keypad on mobile
                            placeholder={t('leitner.settings.customCount')}
                            value={customValue}
                            onChange={handleCustomInputChange}
                            onClick={() => setSelectedOption('custom')} // Select custom on input focus
                            className={`w-full text-center border rounded-md py-3 dark:bg-gray-700 dark:text-white ${
                                selectedOption === 'custom'
                                    ? 'border-blue-500 ring-1 ring-blue-500'
                                    : 'border-gray-300 dark:border-gray-600'
                            }`}
                            // Ensure input is cleared if a preset is re-selected
                            onFocus={() => { if (selectedOption !== 'custom') setCustomValue(''); }}
                        />
                         {/* Optional: Add radio button visually next to input if desired */}
                         {/* <RadioGroupItem value="custom" id="option-custom" className="absolute left-3 top-1/2 -translate-y-1/2"/> */}
                    </div>

                    {/* Don't Show Again Checkbox */}
                    <div className="flex items-center space-x-2 space-x-reverse justify-center pt-2">
                        <Checkbox
                            id="dont-show-again"
                            checked={dontShowAgain}
                            onCheckedChange={(checked) => setDontShowAgain(!!checked)} // Ensure boolean value
                        />
                        <Label htmlFor="dont-show-again" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer px-2">
                            {t('leitner.settings.dontShowAgain')}
                        </Label>
                    </div>
                </div>

                <DialogFooter className="p-4 border-t">
                     {/* Use DialogClose for the cancel button for better accessibility */}
                    {/* <DialogClose asChild>
                         <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
                    </DialogClose> */}
                    <Button onClick={handleSave} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3">
                        {t('leitner.settings.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}