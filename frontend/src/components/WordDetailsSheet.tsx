import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import { DataSeeMore } from '@/types/book';
import { useTranslation } from 'react-i18next';

interface WordDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: string;
  seeMoreData: DataSeeMore | null;
}

export default function WordDetailsSheet({
  open,
  onOpenChange,
  word,
  seeMoreData,
}: WordDetailsSheetProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';

  if (!seeMoreData) return null;

  // Safely check for synonyms existence and content
  const hasSynonyms = seeMoreData.synonyms &&
    (
      (seeMoreData.synonyms.formal && seeMoreData.synonyms.formal.length > 0) ||
      (seeMoreData.synonyms.informal && seeMoreData.synonyms.informal.length > 0) ||
      (seeMoreData.synonyms.neutral && seeMoreData.synonyms.neutral.length > 0)
    );

  // Helper to safely get synonyms or empty array
  const formalSynonyms = seeMoreData.synonyms?.formal || [];
  const informalSynonyms = seeMoreData.synonyms?.informal || [];
  const neutralSynonyms = seeMoreData.synonyms?.neutral || [];

  // Calculate max length to render table rows correctly
  const maxRows = Math.max(formalSynonyms.length, informalSynonyms.length, neutralSynonyms.length);
  const synonymRows = Array.from({ length: maxRows }, (_, i) => ({
    formal: formalSynonyms[i] || '',
    informal: informalSynonyms[i] || '',
    neutral: neutralSynonyms[i] || ''
  }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl h-[85vh] p-0 flex flex-col bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 [&>button]:hidden"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Header - Yellow Background */}
        <div className="flex-none bg-amber-400 p-4 flex items-center justify-between rounded-t-3xl">
           <div className="w-8" />

          <SheetTitle className="text-gray-900 text-lg font-bold">
            {seeMoreData.word || word}
          </SheetTitle>

           <button
             onClick={() => onOpenChange(false)}
             className="p-1 hover:bg-black/10 rounded-full transition-colors"
           >
            <X className="w-6 h-6 text-gray-900" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">

          {/* Main Word Info */}
          <div className="space-y-2">
             <div className="flex items-baseline gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{seeMoreData.word}</h2>
                {seeMoreData.type && (
                    <span className="text-gray-600 dark:text-gray-400 text-sm">({seeMoreData.type})</span>
                )}
             </div>

             {seeMoreData.example && (
                 <div className="text-gray-800 dark:text-gray-200 text-base leading-relaxed">
                    <span className="font-bold">Example: </span> {seeMoreData.example}
                 </div>
             )}

             {/* Registers/Voice if available */}
             {seeMoreData.voice && (
                 <div className="text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-bold">Voice: </span> {seeMoreData.voice}
                 </div>
             )}
             {seeMoreData.registers && (
                 <div className="text-gray-600 dark:text-gray-400 text-sm">
                    <span className="font-bold">Registers: </span> {seeMoreData.registers}
                 </div>
             )}
          </div>

          {/* Synonyms Table - Only if data exists */}
          {hasSynonyms && (
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl overflow-hidden border border-cyan-100 dark:border-cyan-800">
               {/* Table Header */}
               <div className="grid grid-cols-3 bg-cyan-100 dark:bg-cyan-800/40 py-2 px-4 text-center text-sm font-bold text-gray-800 dark:text-gray-200 border-b border-cyan-200 dark:border-cyan-700">
                  <div>Formal</div>
                  <div>Informal</div>
                  <div>Neutral</div>
               </div>

               {/* Table Body */}
               <div className="divide-y divide-cyan-100 dark:divide-cyan-800">
                  {synonymRows.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-3 py-2 px-4 text-center text-sm text-gray-700 dark:text-gray-300">
                          <div className="truncate px-1">{row.formal}</div>
                          <div className="truncate px-1">{row.informal}</div>
                          <div className="truncate px-1">{row.neutral}</div>
                      </div>
                  ))}
               </div>
            </div>
          )}

          {/* Phrasal Verbs - Blue Box */}
          {seeMoreData.phrasal_verbs && seeMoreData.phrasal_verbs.length > 0 && (
              <div className="bg-sky-100 dark:bg-sky-900/30 rounded-xl overflow-hidden border border-sky-200 dark:border-sky-800">
                  <div className="bg-sky-200 dark:bg-sky-800/50 py-2 px-4 text-center font-bold text-gray-800 dark:text-gray-200">
                      Phrasal Verbs
                  </div>
                  <div className="p-4 space-y-4">
                      {seeMoreData.phrasal_verbs.map((pv, idx) => (
                          <div key={idx} className="space-y-2">
                              {pv.verb && (
                                  <div className="font-bold text-gray-900 dark:text-gray-100 text-base">
                                      Verb: {pv.verb}
                                  </div>
                              )}
                              {pv.definition && (
                                  <div className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
                                      <span className="font-semibold">Definition:</span> {pv.definition}
                                  </div>
                              )}
                              {pv.example && (
                                  <div className="text-gray-700 dark:text-gray-300 text-sm italic bg-white/50 dark:bg-black/20 p-2 rounded">
                                      <span className="font-semibold not-italic">Example:</span> {pv.example}
                                  </div>
                              )}
                              {pv.example_translation && (
                                  <div className="text-gray-500 dark:text-gray-500 text-xs text-right dir-rtl mt-1">
                                      {pv.example_translation}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Derivations - Pinkish Box */}
          {seeMoreData.derivations && seeMoreData.derivations.length > 0 && (
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800">
                  <div className="bg-orange-200 dark:bg-orange-800/50 py-2 px-4 text-center font-bold text-gray-800 dark:text-gray-200">
                      Derivations
                  </div>
                  <div className="p-4 space-y-4">
                      {seeMoreData.derivations.map((d, idx) => (
                          <div key={idx} className="space-y-1 border-b border-orange-200 dark:border-orange-800/50 last:border-0 pb-3 last:pb-0">
                              <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900 dark:text-gray-100">{d.word}</span>
                                  {d.type && <span className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400">{d.type}</span>}
                              </div>
                              {d.example && (
                                  <div className="text-gray-700 dark:text-gray-300 text-sm">
                                      {d.example}
                                  </div>
                              )}
                              {d.example_translation && (
                                  <div className="text-gray-500 dark:text-gray-500 text-xs text-right dir-rtl mt-1">
                                      {d.example_translation}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Collocations - Green/Teal Box */}
          {seeMoreData.collocations && seeMoreData.collocations.length > 0 && (
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-xl overflow-hidden border border-teal-100 dark:border-teal-800">
                  <div className="bg-teal-100 dark:bg-teal-800/40 py-2 px-4 text-center font-bold text-gray-800 dark:text-gray-200">
                      Collocations
                  </div>
                  <div className="p-4 space-y-3">
                      {seeMoreData.collocations.map((c, idx) => (
                          <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                              <div className="font-bold text-gray-900 dark:text-gray-100 mb-1">{c.collocation}</div>
                              {c.example && (
                                  <div className="text-gray-600 dark:text-gray-400 text-sm mb-1 italic">
                                      &quot;{c.example}&quot;
                                  </div>
                              )}
                              {/* Use translation or example_translation */}
                              {(c.translation || c.example_translation) && (
                                  <div className="text-gray-500 dark:text-gray-500 text-xs text-right dir-rtl">
                                      {c.translation || c.example_translation}
                                  </div>
                              )}
                          </div>
                      ))}
                  </div>
              </div>
          )}

        </div>
      </SheetContent>
    </Sheet>
  );
}
