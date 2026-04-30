import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, RotateCcw, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import AppHeader from '@/components/AppHeader';
import CelpipPlayerView from '@/components/celpip/CelpipPlayerView';
import CelpipReadingResultDialog, { ReadingResultItem } from '@/components/celpip/CelpipReadingResultDialog';
import { celpipService } from '@/lib/celpipService';

const URL_VIDEO_CELPIP_READING = "https://s15.uupload.ir/files/mrghooghooli/podcast_memory_bank/all_ears_podcast/CELPIP-G_Reading.mp4";

export default function CelpipReadingScreen() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { type, id } = useParams<{ type: string; id: string }>();

    // 1. State Management
    const [loading, setLoading] = useState(true);
    const [textsList, setTextsList] = useState<string[]>([]);
    const [counterQuestions, setCounterQuestions] = useState(0); // 0 to 6
    const [userAnswers, setUserAnswers] = useState<string[]>(Array(39).fill("-"));

    // Result State
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [resultItems, setResultItems] = useState<ReadingResultItem[]>([]);

    // Timer State
    const [timer, setTimer] = useState(0); // in seconds
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // 2. Data Loading
    useEffect(() => {
        loadData();
    }, [id, type]);

    const loadData = async () => {
        setLoading(true);
        const initialList = [
            `Practice Test ${type} - Reading Test`, // 0
            "Reading Test Instructions", // 1
            "On the official test, once you leave a page, you cannot go back to it to change your answers. However, in this practice test, you can.\nWatch the timer in the top right corner to make sure that you complete the Reading Test before the time is up.\nThis Reading Test is identical in format to the official test except that the Reading section of the official test may be slightly longer as it might contain additional questions included for research and development purposes.", // 2
            "For more information on test format, click here.", // 3
            "Reading Instructional Video", // 4
            // Step 2 starts here
            `Practice Test ${type} - Reading Practice Task`, // 5
            "Read the following message.", // 6
            "Canada is surrounded on three sides by oceans. To the north, the Arctic Ocean borders Yukon, Northwest Territories, and Nunavut. Off the west coast of British Columbia is the Pacific Ocean. The Atlantic Ocean, meanwhile, sits to the east of Canada's Maritime provinces, which include Nova Scotia, New Brunswick, and Prince Edward Island.", // 7
            "Using the drop-down menu, choose the best option according to the information given in the message.", // 8
            "1. Which province is on the Pacific Ocean?", // 9
            "Nunavut", "British Columbia", "Nova Scotia", "Prince Edward Island", "British Columbia" // 10-14
        ];

        try {
            const rawData = await celpipService.getWritingTest(`reading test ${id}`);
            const parsedList = flattenData(rawData, type || "A");
            setTextsList([...initialList, ...parsedList]);
        } catch (error) {
            console.error("Failed to load reading test data:", error);
            toast.error("Failed to load test data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const flattenData = (jsonArray: any[], testType: string): string[] => {
        const list: string[] = [];
        try {
            if (!jsonArray || jsonArray.length === 0) return [];
            const testContentStr = jsonArray[0].test_content;
            const mainArray = JSON.parse(testContentStr);
            const index = testType === "B" ? 1 : 0;
            const innerArray = mainArray[index];

            if (Array.isArray(innerArray)) {
                innerArray.forEach((obj: any) => {
                    if (obj.txt_title) list.push(obj.txt_title);
                    if (obj.txt_title_2) list.push(obj.txt_title_2);
                    if (obj.txt_description_1) list.push(obj.txt_description_1);
                    if (obj.txt_description_2) list.push(obj.txt_description_2);
                    if (obj.image_view_1) list.push(obj.image_view_1);
                    if (obj.txt_title_3) list.push(obj.txt_title_3);
                    if (obj.answer) list.push(obj.answer);
                    if (obj.txt_description_3) list.push(obj.txt_description_3);

                    for (let i = 1; i <= 15; i++) {
                        if (obj[`txt_question_${i}`]) list.push(obj[`txt_question_${i}`]);
                        if (obj[`options_${i}_1`]) list.push(obj[`options_${i}_1`]);
                        if (obj[`options_${i}_2`]) list.push(obj[`options_${i}_2`]);
                        if (obj[`options_${i}_3`]) list.push(obj[`options_${i}_3`]);
                        if (obj[`options_${i}_4`]) list.push(obj[`options_${i}_4`]);
                        if (obj[`options_${i}_5`]) list.push(obj[`options_${i}_5`]);
                        if (obj[`answer_${i}`]) list.push(obj[`answer_${i}`]);
                    }
                    if (obj.txt_title_4) list.push(obj.txt_title_4);
                });
            }
        } catch (e) {
            console.error("Flatten Error", e);
        }
        return list;
    };

    // 3. Scoring Logic
    // Based on `generateData` in Kotlin
    const calculateScore = () => {
        if (textsList.length === 0) return;

        const results: ReadingResultItem[] = [];
        let correctCount = 0;

        // Helper to add result
        const addResult = (qIndex: number, ansIndex: number, userAnsIndex: number) => {
            const question = textsList[qIndex];
            const correctAns = textsList[ansIndex];
            const userAns = userAnswers[userAnsIndex];
            const isCorrect = userAns === correctAns;

            if (isCorrect) correctCount++;

            results.push({
                question,
                correctAnswer: correctAns,
                userAnswer: userAns,
                isCorrect
            });
        };

        try {
            // Mapping Logic (Indices from textsList)

            // Practice Task (Q1)
            // Q: 9, A: 14, User: 0
            addResult(9, 14, 0);

            // Part 1 (Q1-Q6)
            // Q1: 18, A: 23, User: 1
            addResult(18, 23, 1);
            // Q2: 24, A: 29, User: 2
            addResult(24, 29, 2);
            // Q3: 30, A: 35, User: 3
            addResult(30, 35, 3);
            // Q4: 36, A: 41, User: 4
            addResult(36, 41, 4);
            // Q5: 42, A: 47, User: 5
            addResult(42, 47, 5);
            // Q6: 48, A: 53, User: 6
            addResult(48, 53, 6);

            // Part 1 Section 2 (Q7-Q11 -> indices 7-11 in userAnswers)
            // Q7 (labeled 10 in android?): 55, A: 60
            addResult(55, 60, 7);
            // Q8: 61, A: 66
            addResult(61, 66, 8);
            // Q9: 67, A: 72
            addResult(67, 72, 9);
            // Q10: 73, A: 78
            addResult(73, 78, 10);
            // Q11: 79, A: 84
            addResult(79, 84, 11);

            // Part 2 (Q12-Q16 -> indices 12-16 in userAnswers)
            // Q1: 89, A: 94
            addResult(89, 94, 12);
            // Q2: 95, A: 100
            addResult(95, 100, 13);
            // Q3: 101, A: 106
            addResult(101, 106, 14);
            // Q4: 107, A: 112
            addResult(107, 112, 15);
            // Q5: 113, A: 118
            addResult(113, 118, 16);

            // Part 2 Section 2 (Q17-Q19 -> indices 17-19)
            // Q10: 121, A: 126 (Wait, Android maps indices 17-19)
            // Logic: 121 is Q, 122-125 options, 126 A.
            addResult(121, 126, 17);
            addResult(127, 132, 18);
            addResult(133, 138, 19);

            // Part 3 (Q20-Q28 -> indices 20-28)
            // Q1: 143, A: 149 (7 items spacing here? Q, 5 Opts, A)
            addResult(143, 149, 20);
            addResult(150, 156, 21);
            addResult(157, 163, 22);
            addResult(164, 170, 23);
            addResult(171, 177, 24);
            addResult(178, 184, 25);
            addResult(185, 191, 26);
            addResult(192, 198, 27);
            addResult(199, 205, 28);

            // Part 4 (Q29-Q33 -> indices 29-33)
            // Q1: 210, A: 215 (6 items spacing: Q, 4 Opts, A)
            addResult(210, 215, 29);
            addResult(216, 221, 30);
            addResult(222, 227, 31);
            addResult(228, 233, 32);
            addResult(234, 239, 33);

            // Part 4 Section 2 (Q34-Q38 -> indices 34-38)
            // Q10: 241, A: 246
            addResult(241, 246, 34);
            addResult(247, 252, 35);
            addResult(253, 258, 36);
            addResult(259, 264, 37);
            addResult(265, 270, 38);

        } catch (e) {
            console.error("Scoring Error: Indices might be out of bounds if data is incomplete.", e);
        }

        setScore(correctCount);
        setResultItems(results);
        setShowResult(true);
    };


    // 4. Timer Logic
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        let duration = 0;
        switch (counterQuestions) {
            case 3: duration = 660; break;
            case 4: duration = 540; break;
            case 5: duration = 600; break;
            case 6: duration = 780; break;
            default: duration = 0;
        }

        if (duration > 0) {
            setTimer(duration);
            timerRef.current = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            setTimer(0);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [counterQuestions]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    // 5. Navigation Handlers
    const handleNext = () => {
        if (counterQuestions < 6) {
            setCounterQuestions(prev => prev + 1);
        } else {
            calculateScore();
        }
        window.scrollTo(0, 0);
    };

    const handleBack = () => {
        if (counterQuestions > 0) {
            setCounterQuestions(prev => prev - 1);
        } else {
            navigate(-1);
        }
        window.scrollTo(0, 0);
    };

    const handleReset = () => {
        // Reset Logic
        // For now, reload data or just reset answers?
        // Typically reset clears answers.
        setUserAnswers(Array(39).fill("-"));
        setCounterQuestions(0);
        window.scrollTo(0, 0);
    };

    const updateAnswer = (index: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
    };

    // 6. Render Content
    const renderContent = () => {
        if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner loading-lg"></span>Loading...</div>;
        if (textsList.length === 0) return <div className="text-center p-10 text-red-500">Failed to load data.</div>;

        switch (counterQuestions) {
            case 0:
                return (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm space-y-4">
                        <div className="flex items-center gap-2">
                            <Info className="w-6 h-6 text-blue-500" />
                            <h2 className="font-bold text-lg text-gray-800 dark:text-white">{textsList[1]}</h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {textsList[2]}
                        </p>
                        <a href="https://www.celpip.ca/take-celpip/test-format/" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm font-bold block">
                            {textsList[3]}
                        </a>
                    </div>
                );

            case 1:
                return (
                     <div className="space-y-4">
                        <h2 className="font-bold text-lg text-center text-gray-800 dark:text-white mb-4">{textsList[4]}</h2>
                        <div className="w-full bg-black rounded-xl overflow-hidden shadow-lg">
                            <CelpipPlayerView src={URL_VIDEO_CELPIP_READING} autoPlay />
                        </div>
                    </div>
                );

            case 2:
                // Practice Task
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                            <h3 className="font-bold mb-2 text-gray-800 dark:text-white">{textsList[5]}</h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{textsList[6]}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                                {textsList[7]}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                             <h3 className="font-bold mb-4 text-gray-800 dark:text-white">{textsList[9]}</h3>
                             <Dropdown value={userAnswers[0]} onChange={(v) => updateAnswer(0, v)} options={textsList.slice(10, 14)} />
                        </div>
                    </div>
                );

            case 3:
                // Part 1
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                            <h3 className="font-bold mb-2 text-gray-800 dark:text-white">{textsList[15]}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{textsList[16]}</p>
                        </div>

                         {/* Questions 1-6 */}
                         <div className="space-y-4">
                            {[0, 1, 2, 3, 4, 5].map((offset, i) => {
                                const baseIndex = 18 + (offset * 6);
                                return (
                                    <QuestionBlock key={i} index={i + 1}
                                        text={textsList[baseIndex]}
                                        value={userAnswers[i + 1]}
                                        onChange={(v) => updateAnswer(i + 1, v)}
                                        options={textsList.slice(baseIndex + 1, baseIndex + 5)}
                                    />
                                );
                            })}
                        </div>

                         {/* Questions 10-14 */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                             <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-blue-500" />
                                <h3 className="font-bold text-gray-800 dark:text-white">{textsList[54]}</h3>
                            </div>
                             <div className="space-y-4">
                                {[0, 1, 2, 3, 4].map((offset, i) => {
                                    const baseIndex = 55 + (offset * 6);
                                    return (
                                        <QuestionBlock key={i} index={10 + i}
                                            text={textsList[baseIndex]}
                                            value={userAnswers[7 + i]}
                                            onChange={(v) => updateAnswer(7 + i, v)}
                                            options={textsList.slice(baseIndex + 1, baseIndex + 5)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );

            case 4:
                // Part 2
                return (
                    <div className="space-y-6">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-2">{textsList[86]}</h3>
                         {/* Safe Image Rendering */}
                         {textsList[87] ? (
                             <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                                <img src={textsList[87]} alt="Reading Task" className="max-w-full h-auto rounded-lg shadow-sm" />
                            </div>
                         ) : null}

                         {/* Questions 1-5 */}
                         <div className="space-y-4">
                            {[0, 1, 2, 3, 4].map((offset, i) => {
                                const baseIndex = 89 + (offset * 6);
                                return (
                                    <QuestionBlock key={i} index={i + 1}
                                        text={textsList[baseIndex]}
                                        value={userAnswers[12 + i]}
                                        onChange={(v) => updateAnswer(12 + i, v)}
                                        options={textsList.slice(baseIndex + 1, baseIndex + 5)}
                                    />
                                );
                            })}
                        </div>

                        {/* Questions 10-12 */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                             <h3 className="font-bold mb-4 text-gray-800 dark:text-white">{textsList[120]}</h3>
                             <div className="space-y-4">
                                {[0, 1, 2].map((offset, i) => {
                                    const baseIndex = 121 + (offset * 6);
                                    return (
                                        <QuestionBlock key={i} index={10 + i}
                                            text={textsList[baseIndex]}
                                            value={userAnswers[17 + i]}
                                            onChange={(v) => updateAnswer(17 + i, v)}
                                            options={textsList.slice(baseIndex + 1, baseIndex + 5)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );

            case 5:
                // Part 3
                return (
                     <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                            <h3 className="font-bold mb-2 text-gray-800 dark:text-white">{textsList[139]}</h3>
                            <h4 className="font-bold mb-2 text-gray-700 dark:text-gray-300">{textsList[142]}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{textsList[141]}</p>
                        </div>

                        <div className="space-y-4">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((offset, i) => {
                                const baseIndex = 143 + (offset * 7);
                                return (
                                    <QuestionBlock key={i} index={i + 1}
                                        text={textsList[baseIndex]}
                                        value={userAnswers[20 + i]}
                                        onChange={(v) => updateAnswer(20 + i, v)}
                                        options={textsList.slice(baseIndex + 1, baseIndex + 6)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );

            case 6:
                // Part 4
                return (
                    <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                            <h3 className="font-bold mb-2 text-gray-800 dark:text-white">{textsList[206]}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{textsList[208]}</p>
                        </div>

                        {/* Questions 1-5 */}
                         <div className="space-y-4">
                            {[0, 1, 2, 3, 4].map((offset, i) => {
                                const baseIndex = 210 + (offset * 6);
                                return (
                                    <QuestionBlock key={i} index={i + 1}
                                        text={textsList[baseIndex]}
                                        value={userAnswers[29 + i]}
                                        onChange={(v) => updateAnswer(29 + i, v)}
                                        options={textsList.slice(baseIndex + 1, baseIndex + 5)}
                                    />
                                );
                            })}
                        </div>

                        {/* Questions 10-14 */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                             <h3 className="font-bold mb-4 text-gray-800 dark:text-white">{textsList[240]}</h3>
                             <div className="space-y-4">
                                {[0, 1, 2, 3, 4].map((offset, i) => {
                                    const baseIndex = 241 + (offset * 6);
                                    return (
                                        <QuestionBlock key={i} index={10 + i}
                                            text={textsList[baseIndex]}
                                            value={userAnswers[34 + i]}
                                            onChange={(v) => updateAnswer(34 + i, v)}
                                            options={textsList.slice(baseIndex + 1, baseIndex + 5)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Unknown Step</div>;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900" dir="rtl">
            <AppHeader title={textsList[0] || t('celpip.reading_test', 'Reading Test')} />

            {/* Custom Toolbar */}
            <div className="px-3 pt-3 pb-0">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between">
                    <div className="flex-1 text-center">
                        <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                            {textsList[0] || t('celpip.reading_test', 'Reading Test')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                         {timer > 0 && (
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-800 dark:text-white font-mono">
                                    {formatTime(timer)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {t('celpip.time_remaining', 'Time Remaining')}
                                </span>
                            </div>
                         )}

                        <button
                            onClick={handleNext}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                        >
                            {counterQuestions === 6 ? t('celpip.show_result', 'Show Result') : t('celpip.next', 'Next')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {renderContent()}
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-100 dark:border-gray-700 fixed bottom-0 left-0 right-0 z-10">
                <div className="flex justify-between items-center max-w-screen-xl mx-auto">
                    <button
                        onClick={handleBack}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        {t('celpip.back', 'Back')}
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <RotateCcw className="w-5 h-5" />
                            {t('celpip.reset', 'Reset')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Result Dialog */}
            <CelpipReadingResultDialog
                isOpen={showResult}
                onClose={() => setShowResult(false)}
                score={score}
                totalQuestions={resultItems.length}
                results={resultItems}
            />
        </div>
    );
}

// Sub-components

function QuestionBlock({ index, text, value, onChange, options }: {
    index: number, text: string, value: string, onChange: (val: string) => void, options: string[]
}) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <p className="font-bold text-gray-800 dark:text-white mb-2 text-sm">
                {index}. {text}
            </p>
            <Dropdown value={value} onChange={onChange} options={options} />
        </div>
    );
}

function Dropdown({ value, onChange, options }: {
    value: string, onChange: (val: string) => void, options: string[]
}) {
    return (
        <select
            value={value === "-" ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
        >
            <option value="" disabled>Select an answer...</option>
            {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
            ))}
        </select>
    );
}
