import { useTranslation } from 'react-i18next';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { DictionaryData, DictionaryExample, DictionarySynonym, DictionaryAntonym } from '@/lib/dictionaryService';
import { Loader2 } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface SmartDictionaryDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    data: DictionaryData | null;
    loading: boolean;
}

export default function SmartDictionaryDrawer({ open, onOpenChange, data, loading }: SmartDictionaryDrawerProps) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    // Helper to safely access data properties
    const getWord = () => data?.input || data?.word || '';
    const getTranslation = () => data?.translated_word || data?.translation || '';

    const getDefinitions = () => {
        if (!data || !data.definitions) return [];
        return data.definitions.map(def => {
            if (typeof def === 'string') return { meaning: def, meaning_translation: '' };
            return def;
        });
    };

    const getExamples = () => {
        if (!data || !data.examples) return [];
        return data.examples.map((ex: DictionaryExample) => ({
            textEn: ex.sentence || ex.en || ex.textEn || '',
            textFa: ex.translation || ex.fa || ex.textFa || ''
        })).filter(ex => ex.textEn || ex.textFa);
    };

    const getSynonyms = () => {
        if (!data || !data.synonyms) return [];
        return data.synonyms.map((syn: DictionarySynonym | string) => {
            if (typeof syn === 'string') return { word: syn, translation: '' };
            return { word: syn.word || '', translation: syn.translation || '' };
        }).filter(s => s.word);
    };

    const getAntonyms = () => {
        if (!data || !data.antonyms) return [];
        return data.antonyms.map((ant: DictionaryAntonym | string) => {
            if (typeof ant === 'string') return { word: ant, translation: '' };
            return { word: ant.word || '', translation: ant.translation || '' };
        }).filter(a => a.word);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="h-[85vh] rounded-t-[30px] bg-white dark:bg-gray-900 border-t-0 outline-none p-0 overflow-hidden flex flex-col">
                <VisuallyHidden.Root>
                    <DrawerTitle>{t('dictionary.title', {defaultValue: 'دیکشنری'})}</DrawerTitle>
                    <DrawerDescription>{t('dictionary.description', {defaultValue: 'نتایج جستجو در دیکشنری'})}</DrawerDescription>
                </VisuallyHidden.Root>

                {/* Custom Header - Yellow Background */}
                <div className="w-full bg-amber-500 py-4 flex items-center justify-center relative shrink-0">
                    <div className="absolute top-2 w-16 h-1.5 rounded-full bg-white/30" />
                    <h2 className="text-xl font-bold text-gray-900 mt-2">{t('dictionary.title', {defaultValue: 'دیکشنری'})}</h2>
                </div>

                <div className="flex-1 overflow-y-auto w-full relative no-scrollbar bg-gray-50 dark:bg-gray-950">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 min-h-[50vh]">
                            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
                            <p className="text-gray-500 font-medium">{t('common.loading', {defaultValue: 'Searching...'})}</p>
                        </div>
                    ) : data ? (
                        <div className="flex flex-col w-full pb-8">

                            {/* Main Word Section */}
                            <div className="bg-amber-100/50 dark:bg-amber-900/10 px-6 py-8 flex flex-col items-center text-center gap-2 border-b border-amber-100 dark:border-amber-800/20">
                                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-wide">{getWord()}</h1>
                                {data.phonetic && <p className="text-gray-500 dark:text-gray-400 font-mono text-lg">/{data.phonetic}/</p>}
                                {getTranslation() && (
                                    <p className="text-2xl text-gray-700 dark:text-gray-200 font-bold mt-2" dir="rtl">{getTranslation()}</p>
                                )}
                            </div>

                            <div className="px-4 flex flex-col gap-6 mt-6">
                                {/* Definitions */}
                                {getDefinitions().length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                                        {getDefinitions().map((def, idx) => (
                                            <div key={idx} className="mb-4 last:mb-0 text-center">
                                                <p className="text-gray-800 dark:text-gray-200 font-medium text-lg mb-1">{def.meaning}</p>
                                                {def.meaning_translation && (
                                                    <p className="text-gray-500 dark:text-gray-400 text-base">{def.meaning_translation}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Examples - Clean List */}
                                {getExamples().length > 0 && (
                                    <div className="bg-transparent space-y-4">
                                        {getExamples().map((ex, i) => (
                                            <div key={i} className="flex flex-col gap-2 p-2">
                                                <p className="text-gray-800 dark:text-gray-200 font-medium text-lg leading-snug text-left dir-ltr">{ex.textEn}</p>
                                                <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed text-right dir-rtl">{ex.textFa}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Synonyms - Purple Container */}
                                {getSynonyms().length > 0 && (
                                    <div className="bg-purple-100 dark:bg-purple-900/20 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-purple-200 dark:bg-purple-900/40 py-2 text-center">
                                            <h3 className="font-bold text-purple-800 dark:text-purple-300 text-lg">
                                                {t('dictionary.synonyms', {defaultValue: 'Synonyms'})}
                                            </h3>
                                        </div>
                                        <div className="p-4 grid grid-cols-2 gap-3">
                                            {getSynonyms().map((syn, i) => (
                                                <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-sm flex flex-col items-center justify-center min-h-[5rem]">
                                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-base mb-0.5">{syn.word}</p>
                                                    {syn.translation && <p className="text-sm text-gray-500 dark:text-gray-400">{syn.translation}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Antonyms - Red Container */}
                                {getAntonyms().length > 0 && (
                                    <div className="bg-rose-100 dark:bg-rose-900/20 rounded-xl overflow-hidden shadow-sm">
                                        <div className="bg-rose-200 dark:bg-rose-900/40 py-2 text-center">
                                            <h3 className="font-bold text-rose-800 dark:text-rose-300 text-lg">
                                                {t('dictionary.antonyms', {defaultValue: 'Antonyms'})}
                                            </h3>
                                        </div>
                                        <div className="p-4 grid grid-cols-2 gap-3">
                                            {getAntonyms().map((ant, i) => (
                                                <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-sm flex flex-col items-center justify-center min-h-[5rem]">
                                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-base mb-0.5">{ant.word}</p>
                                                    {ant.translation && <p className="text-sm text-gray-500 dark:text-gray-400">{ant.translation}</p>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center text-gray-400 px-6">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                <span className="text-4xl grayscale opacity-50">📚</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">{t('dictionary.welcomeTitle', {defaultValue: 'دیکشنری هوشمند'})}</h3>
                            <p className="text-base text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed">
                                {t('dictionary.startTyping', {defaultValue: 'هر کلمه‌ای که می‌خواهی رو بنویس تا معنی و مثال‌هاش رو ببینی.'})}
                            </p>
                        </div>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    );
}
