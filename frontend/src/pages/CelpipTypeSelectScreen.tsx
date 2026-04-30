import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import AppHeader from '@/components/AppHeader';
import CelpipScoreDialog from '@/components/celpip/CelpipScoreDialog';
import CelpipResultDialog from '@/components/celpip/CelpipResultDialog';
import CelpipReadingResultDialog from '@/components/celpip/CelpipReadingResultDialog';
import CelpipListeningResultDialog from '@/components/celpip/CelpipListeningResultDialog';
import { AiGradingResult } from '@/types/celpip';

export default function CelpipTypeSelectScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: string; id: string }>();
  const isRtl = i18n.dir() === 'rtl';
  const location = useLocation();
  const testNumber = location.state?.testNumber || id;

  const [scores, setScores] = useState<Record<string, boolean>>({});
  const [showScoreDialog, setShowScoreDialog] = useState(false);

  // States for detailed result dialogs
  const [showReadingResult, setShowReadingResult] = useState(false);
  const [showListeningResult, setShowListeningResult] = useState(false);
  const [showWritingResult, setShowWritingResult] = useState(false);
  const [showSpeakingResult, setShowSpeakingResult] = useState(false);

  // Data containers
  const [readingData, setReadingData] = useState<any[]>([]);
  const [listeningData, setListeningData] = useState<any[]>([]);
  const [writingResult, setWritingResult] = useState<AiGradingResult | null>(null);
  const [speakingResult, setSpeakingResult] = useState<AiGradingResult | null>(null);

  useEffect(() => {
    const newScores: Record<string, boolean> = {};
    ['reading', 'listening', 'writing', 'speaking'].forEach(section => {
        const result = localStorage.getItem(`celpip_result_${section}_${id}_${type}`);
        newScores[section] = !!result;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScores(newScores);
  }, [id, type]);

  const handleNavigate = (section: string) => {
    navigate(`/celpip/${type}/${id}/${section}`);
  };

  const handleResetScore = () => {
    if (window.confirm("Are you sure you want to delete all progress for this test? This cannot be undone.")) {
        const sections = ['reading', 'listening', 'writing', 'speaking'];
        sections.forEach(section => {
            localStorage.removeItem(`celpip_result_${section}_${id}_${type}`); // Final Result
            localStorage.removeItem(`celpip_answers_${section}_${id}_${type}`); // User Answers
            localStorage.removeItem(`celpip_${section}_answers_${id}_${type}`);
        });
        toast.success("All test data has been reset.");

        const newScores: Record<string, boolean> = {};
        ['reading', 'listening', 'writing', 'speaking'].forEach(section => {
            const result = localStorage.getItem(`celpip_result_${section}_${id}_${type}`);
            newScores[section] = !!result;
        });
        setScores(newScores);
    }
  };

  const handleViewScore = () => {
    setShowScoreDialog(true);
  };

  const handleModuleSelect = (module: 'listening' | 'reading' | 'writing' | 'speaking') => {
      const resultKey = `celpip_result_${module}_${id}_${type}`;
      const savedResult = localStorage.getItem(resultKey);

      if (!savedResult) {
          toast.info(`No results found for ${module}.`);
          return;
      }

      try {
          const parsed = JSON.parse(savedResult);

          if (module === 'reading') {
              setReadingData(parsed);
              setShowReadingResult(true);
          } else if (module === 'listening') {
              setListeningData(parsed);
              setShowListeningResult(true);
          } else if (module === 'writing') {
              setWritingResult(parsed);
              setShowWritingResult(true);
          } else if (module === 'speaking') {
              setSpeakingResult(parsed);
              setShowSpeakingResult(true);
          }
      } catch (e) {
          console.error("Error parsing result", e);
          toast.error("Failed to load result data.");
      }
  };

  const renderCard = (section: string) => (
      <button
        onClick={() => handleNavigate(section)}
        className="relative flex items-center justify-between p-4 bg-white border-2 border-blue-500 rounded-xl active:scale-[0.98] transition-transform shadow-sm h-16 w-full"
      >
        <span className="font-bold text-lg text-blue-600 capitalize pl-2">{section}</span>

        {/* Blue square with dots */}
        <div className="bg-blue-500 rounded-lg p-1.5 flex items-center justify-center">
             <MoreHorizontal className="w-5 h-5 text-white" />
        </div>

        {/* Status Indicator (Subtle overlay or badge) */}
        {scores[section] && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white z-10" />
        )}
      </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <AppHeader
        title="Zaban Fly"
        leftAction={
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm active:scale-95 transition-transform">
                <ChevronLeft className={`w-6 h-6 text-gray-700 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
        }
      />

      <div className="px-6 pb-6 pt-2 max-w-md mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Main Title */}
        <h1 className="text-center font-bold text-xl text-gray-800 mt-2">
            CELPIP-General Practice Tests {testNumber}
        </h1>

        {/* Instructional Text */}
        <div className="text-gray-700 space-y-4 text-sm leading-relaxed text-justify" dir="ltr">
            <div className="flex gap-2">
                <span className="font-bold">1.</span>
                <p>
                    Practice with the same test format as the actual test.
                </p>
            </div>
            <div className="flex gap-2">
                <span className="font-bold">2.</span>
                <p>
                    Review the <span className="text-red-500 font-semibold">Performance Standards for Writing</span> and <span className="text-red-500 font-semibold">Performance Standards for Speaking</span> to understand how your responses are evaluated.
                </p>
            </div>
            <div className="flex gap-2">
                <span className="font-bold">3.</span>
                <p>
                    Answer keys are provided for Listening and Reading tests.
                </p>
            </div>
        </div>

        {/* Score Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
            <button
                onClick={handleViewScore}
                className="flex items-center justify-center py-2.5 px-4 rounded-full border-2 border-blue-500 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors"
            >
                View Score
            </button>

            <button
                onClick={handleResetScore}
                className="flex items-center justify-center py-2.5 px-4 rounded-full border-2 border-blue-500 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors"
            >
                Reset Score
            </button>
        </div>

        {/* Test Section Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
            {renderCard('listening')}
            {renderCard('reading')}
            {renderCard('writing')}
            {renderCard('speaking')}
        </div>

      </div>

      {/* Dialogs */}
      <CelpipScoreDialog
        isOpen={showScoreDialog}
        onClose={() => setShowScoreDialog(false)}
        onSelectModule={handleModuleSelect}
      />

      <CelpipReadingResultDialog
        isOpen={showReadingResult}
        onClose={() => setShowReadingResult(false)}
        results={readingData}
      />

      <CelpipListeningResultDialog
        isOpen={showListeningResult}
        onClose={() => setShowListeningResult(false)}
        results={listeningData}
      />

      {writingResult && (
          <CelpipResultDialog
            isOpen={showWritingResult}
            onClose={() => setShowWritingResult(false)}
            title="Writing Result"
            aiResult={writingResult}
          />
      )}

      {speakingResult && (
          <CelpipResultDialog
            isOpen={showSpeakingResult}
            onClose={() => setShowSpeakingResult(false)}
            title="Speaking Result"
            aiResult={speakingResult}
          />
      )}

    </div>
  );
}
